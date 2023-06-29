const app = angular.module("todoApp", ["ngMaterial", "ui.router", "firebase"]);

app.config(function ($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("/");

  $stateProvider
    .state("login", {
      url: "/",
      template: "<login-page></login-page>",
      resolve: {
        checkAuth: function (FirebaseService, $state) {
          return FirebaseService.getCurrentUser().then(function (user) {
            if (user) {
              // User is already authenticated, redirect to the todo page
              $state.go("todo");
              return false;
            } else {
              // User is not authenticated, allow access to the login page
              return true;
            }
          });
        },
      },
    })
    .state("todo", {
      url: "/todo",
      template: "<todo-page></todo-page>",
      resolve: {
        authCheck: function (FirebaseService, $state) {
          return FirebaseService.getCurrentUser()
            .then(function (user) {
              if (user !== null) {
                // User is signed in, allow access
                return true;
              } else {
                // User is not signed in, redirect to login
                $state.go("login");
                return false;
              }
            })
            .catch(function (error) {
              // Error occurred, handle appropriately
              console.log("Error:", error);
              $state.go("login");
              return false;
            });
        },
      },
    })
    .state("signup", {
      url: "/signup",
      template: "<signup-page></signup-page>",
      resolve: {
        checkAuth: function (FirebaseService, $state) {
          return FirebaseService.getCurrentUser().then(function (user) {
            if (user) {
              // User is already authenticated, redirect to the todo page
              $state.go("todo");
              return false;
            } else {
              // User is not authenticated, allow access to the login page
              return true;
            }
          });
        },
      },
    });
});

app.controller("mainCtrl", function () {});

app.service("FirebaseService", [
  "firebase",
  function (firebase) {
    const firebaseConfig = {
      // FIREBASE CONFIG HERE
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    // Get the Firebase auth service
    const auth = firebase.auth();
    const firestore = firebase.firestore();

    // Public API for Firebase authentication
    this.signInWithEmailAndPassword = function (email, password) {
      return auth.signInWithEmailAndPassword(email, password);
    };

    this.signOut = function () {
      return auth.signOut();
    };

    this.getCurrentUser = function () {
      return new Promise(function (resolve, reject) {
        const unsubscribe = auth.onAuthStateChanged(function (user) {
          unsubscribe();
          resolve(user || null);
        });
      });
    };

    this.createUserWithEmailAndPassword = function (email, password) {
      return auth.createUserWithEmailAndPassword(email, password);
    };

    // Other authentication methods can be added as needed

    // Return the auth service to access other Firebase authentication features if needed
    this.auth = function () {
      return auth;
    };

    this.getFirestore = function () {
      return firestore;
    };

    this.addUser = function (collectionName, documentId, data) {
      const collectionRef = firestore.collection(collectionName);
      const documentRef = collectionRef.doc(documentId);
      return documentRef
        .set(data)
        .then(function () {
          console.log("Document added with ID:", documentId);
          return documentId;
        })
        .catch(function (error) {
          console.log("Error adding data to Firestore:", error);
          throw error;
        });
    };
    // Sub-service to add a "todo" document under the user's "todos" collection with Unix epoch timestamp as the ID
    this.addTodo = function (userId, todoData) {
      const userRef = firestore.collection("users").doc(userId);
      const userTodosRef = userRef.collection("todos");
      const todoId = new Date().getTime().toString(); // Generate Unix epoch timestamp as the ID

      todoData.todoId = todoId;

      return userTodosRef
        .doc(todoId)
        .set(todoData)
        .then(function () {
          console.log("Todo added with ID:", todoId);
          return todoId;
        })
        .catch(function (error) {
          console.log("Error adding todo to Firestore:", error);
          throw error;
        });
    };
    this.deleteTodo = function (userId, todoId) {
      var userRef = firestore.collection("users").doc(userId);
      var userTodosRef = userRef.collection("todos");
      var todoRef = userTodosRef.doc(todoId);

      return todoRef
        .update({ status: "inactive" })
        .then(function () {
          console.log("Todo status updated:", todoId);
        })
        .catch(function (error) {
          console.log("Error updating todo status:", error);
          throw error;
        });
    };

    // Sub-service to update the checked status of a todo
    this.updateChecked = function (uid, todoId, checked) {
      const userRef = firestore.collection("users").doc(uid);
      const userTodosRef = userRef.collection("todos");
      const todoRef = userTodosRef.doc(todoId);

      return todoRef
        .update({ checked: checked })
        .then(function () {
          console.log("Todo checked status updated:", todoId);
        })
        .catch(function (error) {
          console.log("Error updating todo checked status:", error);
          throw error;
        });
    };

    this.subscribeToTodos = function (uid, callback) {
      firestore
        .collection("users")
        .doc(uid)
        .collection("todos")
        .where("status", "==", "active")
        .onSnapshot(
          function (querySnapshot) {
            var todos = [];
            querySnapshot.forEach(function (doc) {
              var todo = doc.data();
              todos.push(todo);
            });
            callback(todos);
          },
          function (error) {
            console.log(error);
          }
        );
    };
  },
]);
