function LoginPageController(FirebaseService, $state, $timeout) {
  const vm = this;
  vm.email = '';
  vm.password = '';
  vm.loading = false; // Initialize loading state

  vm.login = function() {
    vm.loading = true; // Show the loader

    FirebaseService.signInWithEmailAndPassword(vm.email, vm.password)
      .then(function(userCredential) {
        // Login successful, perform desired actions
        Swal.fire({
          title: 'Log in Success!',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500
        });
        vm.loading = false; 
        $state.go('todo'); // Redirect to the todo page
      })
      .catch(function(error) {
        // Login error, handle appropriately
        Swal.fire({
          title: 'Oops...',
          icon: 'error',
          text: `${error}`
        });
        $timeout(function() {
          vm.loading = false; // Hide the loader with a delay
        }, 1000);
      });
  };
}
  
app.component('loginPage', {
    templateUrl: 'components/login-page/login-page.html',
    controller: LoginPageController,
    controllerAs: 'vm',
    bindings: {
      // component bindings if needed
    },
  });


  