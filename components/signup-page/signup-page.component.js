function SignupPageController(FirebaseService, $state, $timeout) {
  const vm = this;
  vm.username = '';
  vm.email = '';
  vm.password = '';
  vm.loading = false; // Initialize loading state

  vm.signup = function() {
    vm.loading = true; // Show the loader

    FirebaseService.createUserWithEmailAndPassword(vm.email, vm.password)
      .then(function(userCredential) {
        FirebaseService.addUser('users', userCredential.user.uid, {
          username: vm.username,
          email: vm.email,
          uid: userCredential.user.uid,
          password: vm.password
        });
        // Login successful, perform desired actions
        Swal.fire({
          title: 'Sign Up Success!',
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

app.component('signupPage', {
    templateUrl: 'components/signup-page/signup-page.html',
    controller: SignupPageController,
    controllerAs: 'vm',
    bindings: {
      // component bindings if needed
    },
  });


  