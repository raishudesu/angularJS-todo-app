function TodoAppController(FirebaseService, $state, $scope) {
  const vm = this;
  vm.todos = [];

  vm.addToList = function (title) {
    if (title) {
      const newItem = {
        title: title,
        checked: false,
        createdAt: new Date().toISOString(),
        status: "active",
      };

      FirebaseService.getCurrentUser().then(function (user) {
        if (user) {
          var uid = user.uid;
          FirebaseService.addTodo(uid, newItem)
            .then(function (docRef) {
              console.log("Document added with ID:", docRef.id);
              Swal.fire({
                title: "Success!",
                icon: "success",
                text: "Added Successfully!",
                showConfirmButton: false,
                timer: 1000,
              });
            })
            .catch(function (error) {
              console.log("Error adding data to Firestore:", error);
              Swal.fire({
                icon: "error",
                text: "Failed to add item!",
                showConfirmButton: false,
                timer: 1000,
              });
            });
        }
      });

      // Clear the input field
      vm.title = "";
    } else {
      Swal.fire({
        icon: "error",
        text: "Input field is empty!",
        showConfirmButton: false,
        timer: 1000,
      });
    }
  };
  vm.getTodo = function () {
    FirebaseService.getCurrentUser().then(function (user) {
      FirebaseService.subscribeToTodos(user.uid, function (todos) {
        vm.todos = todos;
        $scope.$apply();
      });
    });
  };

  vm.getTodo();

  vm.taskDone = function(todoId, checked){
    FirebaseService.getCurrentUser().then(function (user) {
      FirebaseService.updateChecked(user.uid, todoId, checked);
    });
  }



  vm.removeFromList = function (uid) {
    FirebaseService.getCurrentUser().then(function (user) {
      FirebaseService.deleteTodo(user.uid, uid);
    });
  };

  vm.signOut = function () {
    FirebaseService.signOut();
    Swal.fire({
      title: "Log Out Success!",
      icon: "success",
      showConfirmButton: false,
      timer: 1500,
    });
    $state.go("login");
  };
}

app.component("todoPage", {
  templateUrl: "components/todo-page/todo-page.html",
  controller: TodoAppController,
  controllerAs: "vm",
  bindings: {
    // component bindings if needed
  },
});
