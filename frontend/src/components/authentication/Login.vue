<template>
  <form>
    <div class="row justify-content-center">
      <div class="col-4">
        <div class="form-group">
          <label for="emailField">Email address</label>
          <input
            type="email"
            class="form-control"
            id="emailField"
            placeholder="Enter email"
            v-model="email"
          />
        </div>
      </div>
    </div>
    <div class="row justify-content-center">
      <div class="col-4">
        <div class="form-group">
          <label for="passwordField">Password</label>
          <input
            type="password"
            class="form-control"
            id="passwordField"
            placeholder="Password"
            v-model="password"
          />
        </div>
      </div>
    </div>
     <div class="row justify-content-center">
      <p v-if="showError" style="color: red">{{ errorText }}</p>
    </div>
    <div class="row justify-content-center">
      <p v-if="showSuccess" style="color: green">{{ successText }}</p>
    </div>
    <div class="row justify-content-center">
      <button type="button" class="btn btn-primary" @click="login">
        Login
      </button>
    </div>
  </form>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      email: "",
      password: "",
      errorText: "",
      showError: false,
      successText: "Logged in!",
      showSuccess: false,
    };
  },
  methods: {
    async login() {
      this.showSuccess = false;
      if (localStorage.getItem("loggedIn") === 'true') {
        this.errorText = "You are already logged in";
        this.showError = true;
        return;
      }
      try {
        const response = await this.axios.post("/users/login", {
            email: this.email,
            password: this.password,
          });
        localStorage.setItem("userId", response.data.userId);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("loggedIn", true);
        this.showError = false;
        this.showSuccess = true;
      } catch ( err ) {
        console.log(err);
        if (err.response && err.response.status === 400) {
          this.errorText = "Username or password is incorrect";
        } else {
          this.errorText = "Something went wrong :(";
        }
        this.showError = true;
      }
    }
  },
};
</script>

<style scoped>
form {
  margin: 40px;
}
</style>