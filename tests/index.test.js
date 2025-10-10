const axios2 = require("axios");

const BACKEND_URL = 'http://localhost:4000'
const WS_URL = 'ws://localhost:4001'

const axios = {
    post: async (...args) => {
        try {
            const res = await axios2.post(...args)
            return res;
        } catch (error) {
            return error.response;
        }
    },
    get: async (...args) => {
        try {
            const res = await axios2.get(...args)   
            return res;
        } catch (error) {
            return error.response;
        }
    },
    put: async (...args) => {   
        try {
            const res = await axios2.put(...args)
            return res;
        } catch (error) {
            return error.response;
        }
    },
    delete: async (...args) => {
        try {
            const res = await axios2.delete(...args)   
            return res;
        } catch (error) {
            return error.response;
        }
    }
}

describe("Authentication", () => {
    test('User is able to sign up only once', async () => {
        const username = "kirat" + Math.random();
        const password = "123456";
        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "Admin"
        })
        expect(response.status).toBe(200);
        const updatedResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "Admin"
        })
        expect(updatedResponse.status).toBe(400)
    });

    test('Signup request fails if the username is empty', async () => {
        const password = "123456";

        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`,{
            password
        })

        expect(response.status).toBe(400);
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

        expect (response.status).toBe(200);
        expect(response.data.token).toBeDefined();
    });
    
    test('Signin fails if the username and password are incorrect', async () => {
        const username = "kirat" + Math.random();
        const password = "123456"

        await axios.post(`${BACKEND_URL}/api/v1/signup`,{
            username,
            password
        });

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`,{
            username: "Wrongusername",
            password
        });

        expect(response.status).toBe(403);
    });
})

describe("User metadata endpoint", () => {

    let token = "";
    let avatarId = "";

    beforeAll(async () => {
        const username = 'kirat' + Math.random()
        const password = `123456`

        await axios.post(`${BACKEND_URL}/api/v1/signup`,{
            username,
            password,
            type: "Admin"
        })
        
        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`,{
            username,
            password
        })

        token = response.data.token;

        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            name: "Timmy"
        }, {
            headers: {
                "authorization": `Bearer ${token}`
            }
        })

        avatarId = avatarResponse.data.id;

    })

    test("User cant update their metadata with a wrong avatar id", async() => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId: "123123123"
        },{
            headers: {
                "authorization": `Bearer ${token}`
            }
        })

        expect(response.status).toBe(400);
    });

    test("User can update their metadata with the right avatar id", async() => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId
        },{
            headers: {
                "authorization": `Bearer ${token}`
            }
        })
        expect(response.status).toBe(200);
    });

    test("User is not able to update their metadata if the auth header is not provided", async() => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId
        })

        expect(response.status).toBe(403);
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
            type: "Admin"
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
        avatarId = avatarResponse.data.id;

    });

    test("Get back avatar information for a user", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`,{
            headers: {
                "authorization": `Bearer ${token}`
            }
        });
        expect(response.data.avatars.length).toBe(1);
        expect(response.data.avatars[0].userId).toBe(userId);
    })

    test("Available avatars lists the recently created avatar", async () => {
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
            type: "Admin"
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
            type: "User"
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
            name: "Test",
            dimensions: "100x200",
            mapId: mapId
        },{
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        })
        expect(response.data.spaceId).toBeDefined();
    })

    test("User is able to create a space without mapId(empty space)", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            name: "Test",
            dimensions: "100x200"
        },{
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        })
        expect(response.data.spaceId).toBeDefined();
    })

    test("User is not able to create a space without mapId and dimensions", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            name: "Test"
        },{
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        })
        expect(response.status).toBe(400);
    })

    test("User is not able to delete a space that does not exist", async () => {
        const response = await axios.delete(`${BACKEND_URL}/api/v1/space/randomIdDoesntExist`,{
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        })
        expect(response.status).toBe(400);
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

        expect(deleteResponse.status).toBe(200);
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

        expect(adminResponse.status).toBe(403);
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
        const spaceCreateResponse = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name": "Test",
            "dimensions": "100x200"
        },{
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        });
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`,{
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        });
        const filteredSpace = response.data.spaces.find(x => x.id === spaceCreateResponse.data.spaceId);
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
            type: "Admin"
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
            type: "User"
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
        spaceId = spaceCreateResponse.data.spaceId;

    })    

    test("Incorrect spaceId returns a 400", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/12345`,{
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        });
        expect(response.status).toBe(400);
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
        const elementId = response.data.elements[0].id;
        const spacy = await axios.delete(`${BACKEND_URL}/api/v1/space/element/${elementId}`,{
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
        const addelement = await axios.post(`${BACKEND_URL}/api/v1/space/element`, {
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
        expect(addelement.status).toBe(404);
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
    
    beforeAll(async () => {
        const username = `kirat-${Math.random()}`
        const password = `123456`

        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`,{
            username,
            password,
            type: "Admin"
        })
        
        adminId = signupResponse.data.userId;

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`,{
            username,
            password,
        })

        adminToken = response.data.token;

        const UserSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`,{
            username: username + '-user',
            password,
            type: "User"
        })
        
        userId = UserSignupResponse.data.userId;

        const UserResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`,{
            username: username +'-user',
            password
        })

        userToken = UserResponse.data.token;
         
    });

    test("User is not able to hit admin Endpoints", async () => {
        
        const elementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true 
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


        expect(elementResponse.status).toBe(403);
        expect(mapResponse.status).toBe(403);
        expect(avatarResponse.status).toBe(403);
        expect(updateElementResponse.status).toBe(403);
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

        expect(elementResponse.status).toBe(200);
        expect(mapResponse.status).toBe(200);
        expect(avatarResponse.status).toBe(200);

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
        expect(updateElementResponse.status).toBe(200);

    })

})

// describe("Websockets tests", () => {

//     let adminToken;
//     let adminUserId;
//     let userToken;
//     let userId;
//     let mapId;
//     let element1Id;
//     let element2Id;
//     let spaceId;
//     let ws1;
//     let ws2;
//     let ws1messages = [];
//     let ws2messages = [];
//     let userX;
//     let userY;
//     let adminX;
//     let adminY;

//     function waitForAndPopLatestMessage(messageArray) {
//         return new Promise(r => {
//             if(messageArray.length > 0){
//                 resolve(messageArray.shift())
//             }else{
//                 let interval = setInterval(() => {
//                     if(messageArray.length > 0) {
//                         resolve(messageArray.shift())
//                         clearInterval(interval)
//                     }
//                 }, 100 )
//             }
//         })
//     }

//     async function setupHTTP() {
//         const username = `kirat-${Math.random()}`;
//         const password = '123456'

//         const adminSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
//             username: username,
//             password: password,
//             role: "admin"
//         })

//         adminUserId = adminSignupResponse.data.userId;

//         const adminSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
//             username: username,
//             password: password
//         })

//         adminToken = adminSigninResponse.data.token;

//         const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
//             username: username + '-user',
//             password: password,
//             role: "user"
//         })

//         userId = userSignupResponse.data.userId;

//         const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
//             username: username + '-user',
//             password: password
//         })

//         userToken = userSigninResponse.data.token;

//         const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
//             "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
//             "width": 1,
//             "height": 1,
//             "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
//         },{
//             headers: {
//                 "authorization": `Bearer ${adminToken}`
//             }
//         })

//         const element2Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
//             "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
//             "width": 1,
//             "height": 1,
//             "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
//         },{
//             headers: {
//                 "authorization": `Bearer ${adminToken}`
//             }
//         })
         
//         element1Id = element1Response.data.id;
//         element2Id = element2Response.data.id;

//         const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
//             "thumbnail": "https://thumbnail.com/a.png",
//             "dimensions": "100x200",
//             "name": "100 person interview room",
//             "defaultElements": [{
//                     elementId: element1Id,
//                     x: 20,
//                     y: 20
//                 }, {
//                     elementId: element1Id,
//                     x: 18,
//                     y: 20
//                 }, {
//                     elementId: element2Id,
//                     x: 19,
//                     y: 20
//                 }
//             ]
//         }, {
//             headers: {
//                 "authorization": `Bearer ${adminToken}`
//             }
//         });

//         mapId = mapResponse.data.id;

//         const spaceCreateResponse = await axios.post(`${BACKEND_URL}/api/v1/space`,{
//             "name": "Test",
//             "dimensions": "100x200",
//             "mapId": mapId
//         },{
//             headers: {
//                 "authorization": `Bearer ${userToken}`
//             }
//         })

//         spaceId = spaceCreateResponse.data.id;
//     }

//     async function setupWS() {
//         ws1 = new WebSocket(WS_URL);
    
//         await new Promise(r => {
//             ws1.onopen = r
//         })
          
//         ws1.onmessage = (event) => {
//             ws1messages.push(JSON.parse(event.data))
//         }

//         ws2 = new WebSocket(WS_URL);

//         await new Promise(r => {
//             ws2.onopen = r
//         })

//         ws2.onmessage = (event) => {
//             ws2messages.push(JSON.parse(event.data))
//         }

//     }

//     beforeAll( () => {
//        setupHTTP();
//        setupWS();
//     })

//     test("Get back acknowledgement for joining the space", () => {
//         ws1.send(JSON.stringify)({
//             "type": "join",
//             "payload": {
//                 "spaceId": spaceId,
//                 "token": adminToken
//             }
//         })
//         const message1 = waitForAndPopLatestMessage(ws1messages);

//         ws2.send(JSON.stringify)({
//             "type": "join",
//             "payload": {
//                 "spaceId": spaceId,
//                 "token": userToken
//             }
//         })

//         const message2 = waitForAndPopLatestMessage(ws2messages);
//         const message3 = waitForAndPopLatestMessage(ws1messages);
    
//         expect(message1.type).toBe("space-joined");
//         expect(message2.type).toBe("space-joined");
         
//         expect(message1.payload.users.length).toBe(0);
//         expect(message2.payload.users.length).toBe(1);
//         expect(message3.type).toBe("user-join");
//         expect(message3.payload.x).toBe(message2.payload.spawn.x);
//         expect(message3.payload.y).toBe(message2.payload.spawn.y);
//         expect(message3.payload.userId).toBe(userId);

//         adminX = message1.payload.spawn.x
//         adminY = message1.payload.spawn.y

//         userX = message2.payload.spawn.x
//         userY = message2.payload.spawn.y

//     })

//     test("User should not be able to move accross the boundary of the wall", async () => {
//         ws1.send(JSON.stringify)({
//             type: "movement",
//             payload: {
//                 x: 1000000,
//                 y: 200000
//             }
//         });

//         const message = await waitForAndPopLatestMessage(ws1messages);
//         expect(message.type).toBe("movement-rejected")
//         expect(message.payload.x).toBe(adminX)
//         expect(message.payload.y).toBe(adminY) 
//     })

//     test("User should not be able to move accross the boundary of the wall", async () => {
//         ws1.send(JSON.stringify)({
//             type: "movement",
//             payload: {
//                 x: 1000000,
//                 y: 200000
//             }
//         });

//         const message = await waitForAndPopLatestMessage(ws1messages);
//         expect(message.type).toBe("movement-rejected")
//         expect(message.payload.x).toBe(adminX)
//         expect(message.payload.y).toBe(adminY) 
//     })

//     test("User should not be able to move two blocks at a time", async () => {
//         ws1.send(JSON.stringify)({
//             type: "movement",
//             payload: {
//                 x: adminX + 2,
//                 y: adminY
//             }
//         });

//         const message = await waitForAndPopLatestMessage(ws1messages);
//         expect(message.type).toBe("movement-rejected")
//         expect(message.payload.x).toBe(adminX)
//         expect(message.payload.y).toBe(adminY) 
//     })

//     test("Correct movement should be broadcasted to the other sockets in the room", async () => {
//         ws1.send(JSON.stringify)({
//             type: "movement",
//             payload: {
//                 x: adminX + 1,
//                 y: adminY,
//                 userId: adminUserId
//             }
//         });

//         const message = await waitForAndPopLatestMessage(ws2messages);
//         expect(message.type).toBe("movement")
//         expect(message.payload.x).toBe(adminX + 1)
//         expect(message.payload.y).toBe(adminY) 
//     })

//     test("If a user leaves, the other user recieves a leave event", async () => {
//         ws1.close();
//         const message = await waitForAndPopLatestMessage(ws2messages);
//         expect(message.type).toBe("user-left")
//         expect(message.payload.userId).toBe(adminUserId)
//     })

// })