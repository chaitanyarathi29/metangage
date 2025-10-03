const axios = require("axios");

const BACKEND_URL = 'http://localhost:3000'

describe("Authentication", () => {
    test('User is able to sign up only once', async () => {
        const username = "kirat" + Math.random();
        const password = "123456";
        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })

        expect(response.statusCode).toBe(200);
        const updatedResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })

        expect(updatedResponse.statusCode).toBe(400)
    });

    test('Signup request fails if the username is empty', async () => {
        const password = "123456";

        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, () => {
            password
        })

        expect(response.statusCode).toBe(400);
    });

    test('Signin succeeds if the username and password are correct', async () => {
        const username = 'kirat' + Math.random()
        const password = "123456"

        await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password
        });

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        });

        expect (response.statusCode).toBe(200);
        expect(response.data.token).toBeDefined();
    });
    
    test('Signin fails if the username and password are incorrect', async () => {
        const username = "kirat" + Math.random();
        const password = "123456"

        await axios.post(`${BACKEND_URL}/api/v1/signup`,{
            username,
            password
        });

        const response = await axios.post(`{BACKEND_URL}/api/v1/signin`,{
            username: "Wrongusername",
            password
        });

        expect(response.statusCode).toBe(403);
    });
})

describe("User metadata endpoint", () => {

    let token = "";
    let avatarId = "";

    beforeAll(async () => {
        const username = `kirat-${Math.random()}`
        const password = `123456`

        await axios.post(`${BACKEND_URL}/api/v1/signup`,{
            username,
            password,
            type: "admmin"
        })
        
        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`,{
            username,
            password
        })

        token = response.data.token;

        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            "name": "Timmy"
        })

        avatarId = avatarResponse.data.avatarId;

    })

    test("User cant update their metadata with a wrong avatar id", async() => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId: "123123123"
        },{
            headers: {
                "authorization": `Bearer ${token}`
            }
        })

        expect(response.statusCode).toBe(400);
    });

    test("User can update their metadata with the right avatar id", async() => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId
        },{
            headers: {
                "authorization": `Bearer ${token}`
            }
        })

        expect(response.statusCode).toBe(200);
    });

    test("User is not able to update their metadata if the auth header is not provided", async() => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId
        })

        expect(response.statusCode).toBe(403);
    });
})

describe("User avatar information", () => {
    let token = "";
    let avatarId = "";
    let userId = "";

    beforeAll(async () => {
        const username = `kirat-${Math.random()}`
        const password = `123456`

        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`,{
            username,
            password,
            type: "admin"
        })
        
        userId = signupResponse.data.userId;

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`,{
            username,
            password
        })

        token = response.data.token;

        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            "name": "Timmy"
        },{
            headers: {
                "authorization": `Bearer ${token}`
            }
        })

        avatarId = avatarResponse.data.avatarId;

    });

    test("Get back avatar information for a user", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`);

        expect(response.data.avatars.length.toBe(1));
        expect(response.data.avatars[0].userId).toBe(userId);
    })

    test("Available avatars lists the reecently created avatar", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/avatars`);
        expect(response.data.avatars.length).not.toBe(0);
        const currentAvatar = response.data.avatars.find(x => x.id === avatarId);
        expect(currentAvatar).toBeDefined();
    })
})

describe("Space information", () => {
    let mapId;
    let element1Id;
    let element2Id;
    let adminToken;
    let adminId;
    let userId;
    let userToken;

    beforeAll(async () => {
        const username = `kirat-${Math.random()}`
        const password = `123456`

        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`,{
            username,
            password,
            type: "admin"
        })
        
        adminId = signupResponse.data.userId;

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`,{
            username,
            password,
        })

        adminToken = response.data.token;

        const UserSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`,{
            username: username+'-user',
            password,
            type: "user"
        })
        
        userId = UserSignupResponse.data.userId;

        const UserResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`,{
            username: username+'-user',
            password
        })

        userToken = UserResponse.data.token; 

        const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        },{
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        })

        const element2Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        },{
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        })
         
        element1Id = element1Response.data.id;
        element2Id = element2Response.data.id;

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "100 person interview room",
            "defaultElements": [{
                    elementId: element1Id,
                    x: 20,
                    y: 20
                }, {
                    elementId: element1Id,
                    x: 18,
                    y: 20
                }, {
                    elementId: element2Id,
                    x: 19,
                    y: 20
                }
            ]
        }, {
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        })

        mapId = mapResponse.data.id;

    });

    test("User is able to create a space", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name": "Test",
            "dimensions": "100x200",
            "mapId": mapId
        },{
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        })

        expect(response.data.spaceId).toBeDefined();
    })

    test("User is able to create a space without mapId(empty space)", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name": "Test",
            "dimensions": "100x200"
        },{
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        })

        expect(response.data.spaceId).toBeDefined();
    })

    test("User is not able to create a space without mapId and dimensions", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name": "Test"
        },{
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        })

        expect(response.statusCode).toBe(400);
    })

    test("User is not able to delete a space that doesnot exist", async () => {
        const response = await axios.delete(`${BACKEND_URL}/api/v1/space/randomIdDoesntExist`, {
            "name": "Test"
        },{
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        })

        expect(response.statusCode).toBe(400);
    })

    test("User is able to delete a space that does exists", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name": "Test",
            "dimensions": "100x200"
        },{
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        })

        const deleteResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/${response.data.spaceId}`,{
            headers: {
                authorization: `Bearer ${userToken}`
            }
        })

        expect(deleteResponse.statusCode).toBe(200);
    })

    test("User should not be able to delete a space created by another user", async () => {
        
        const userResponse = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name": "Test",
            "dimensions": "100x200"
        },{
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        })
        
        const adminResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/${userResponse.data.spaceId}`,{
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        });

        expect(adminResponse.statusCode).toBe(400);
    })

    test("Admin has no spaces initially", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`,{
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        })
        expect(response.data.spaces.length).toBe(0);
    })
    test("Admin adding space....and checking", async() => {
        const spaceCreateResponse = await axios.post(`${BACKEND_URL}/api/v1/space/all`, {
            "name": "Test",
            "dimensions": "100x200"
        },{
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        });
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`,{
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        });
        const filteredSpace = response.data.spaces.find(x => x.id === spaceCreateResponse.spaceId)
        expect(response.data.spaces.length).toBe(1);
        expect(filteredSpace).toBeDefined();
    })
})

describe("Arena information", () => {
    let mapId;
    let element1Id;
    let element2Id;
    let adminToken;
    let adminId;
    let userId;
    let userToken;
    let spaceId;

    beforeAll(async() => {
        const username = `kirat-${Math.random()}`
        const password = `123456`

        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`,{
            username,
            password,
            type: "admin"
        })
        
        adminId = signupResponse.data.userId;

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`,{
            username,
            password,
        })

        adminToken = response.data.token;

        const UserSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`,{
            username: username+'-user',
            password,
            type: "user"
        })
        
        userId = UserSignupResponse.data.userId;

        const UserResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`,{
            username: username+'-user',
            password
        })

        userToken = UserResponse.data.token;

        const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        },{
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        })

        const element2Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        },{
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        })
         
        element1Id = element1Response.data.id;
        element2Id = element2Response.data.id;

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "100 person interview room",
            "defaultElements": [{
                    elementId: element1Id,
                    x: 20,
                    y: 20
                }, {
                    elementId: element1Id,
                    x: 18,
                    y: 20
                }, {
                    elementId: element2Id,
                    x: 19,
                    y: 20
                }
            ]
        }, {
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        });

        mapId = mapResponse.data.id;

        const spaceCreateResponse = await axios.post(`${BACKEND_URL}/api/v1/space`,{
            "name": "Test",
            "dimensions": "100x200",
            "mapId": mapId
        },{
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        })

        spaceId = spaceCreateResponse.data.id;
         
    })    

    test("Incorrect spaceId returns a 400", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/12345`,{
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        });
        expect(response.statusCode).toBe(400);
    })

    test("Correct spaceId returns a 200", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`,{
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        });
        expect(response.data.dimensions).toBe("100x200")
        expect(response.data.elements.length).toBe(3)
    })

    test("Delete an endpoint is able to delete an element", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`);
        
        await axios.delete(`${BACKEND_URL}/api/v1/space/element`, {
            spaceId: spaceId,
            elementId: response.data.elements[0].id
        },{
            headers: {
                "authorization": `Bearer ${userToken}`
            }}
        );                      

        const newResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`,{
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        });

        expect(newResponse.data.elements.length).toBe(2);
    });

    test("Adding an element fails if the element lies outside the dimensions", async () => {
        await axios.post(`${BACKEND_URL}/api/v1/space/element`, {
            "elementId": element1Id,
            "spaceId": spaceId,
            "x": 10000,
            "y": 20000
        },{
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        });

        const newResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`,{
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        });

        expect(newResponse.statusCode).toBe(404);
    });


    test("Adding an element works as expected", async () => {
        await axios.post(`${BACKEND_URL}/api/v1/space/element`, {
            "elementId": element1Id,
            "spaceId": spaceId,
            "x": 50,
            "y": 20
        },{
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        });

        const newResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`,{
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        });

        expect(newResponse.data.elements.length).toBe(3);
    });

})

describe("Admin Endpoints", () => {
    let adminToken;
    let adminId;
    let userId;
    let userToken;
    
    beforeAll(async() => {
        const username = `kirat-${Math.random()}`
        const password = `123456`

        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`,{
            username,
            password,
            type: "admin"
        })
        
        adminId = signupResponse.data.userId;

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`,{
            username,
            password,
        })

        adminToken = response.data.token;

        const UserSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`,{
            username: username+'-user',
            password,
            type: "user"
        })
        
        userId = UserSignupResponse.data.userId;

        const UserResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`,{
            username: username+'-user',
            password
        })

        userToken = UserResponse.data.token;
         
    });

    test("User is not able to hit admin Endpoints", async () => {
        
        const elementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        },{
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        })

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "100 person interview room",
            "defaultElements": []
        }, {
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        });

        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            "name": "Timmy"
        },{
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        })

        const updateElementResponse = await axios.put(`${BACKEND_URL}/api/v1/admin/element/123`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            "name": "Timmy"
        },{
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        })


        expect(elementResponse.statusCode).toBe(403);
        expect(mapResponse.statusCode).toBe(403);
        expect(avatarResponse.statusCode).toBe(403);
        expect(updateElementResponse.statusCode).toBe(403);
    })

    test("Admin is able to hit admin Endpoints", async () => {
        
        const elementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true 
        },{
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        })

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "100 person interview room",
            "defaultElements": []
        }, {
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        });

        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            "name": "Timmy"
        },{
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        })

        expect(elementResponse.statusCode).toBe(200);
        expect(mapResponse.statusCode).toBe(200);
        expect(avatarResponse.statusCode).toBe(200);

    })

    test("Admin is able to update an element", async () => {

        const elementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true 
        },{
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        })
        
        const updateElementResponse = await axios.put(`${BACKEND_URL}/api/v1/admin/element/${elementResponse.data.id}`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            "name": "Timmy"
        },{
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        })
        expect(updateElementResponse.statusCode).toBe(200);

    })

})

describe("Websockets tests", () => {
    
})