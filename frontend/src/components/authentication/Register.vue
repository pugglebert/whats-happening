<template>
  <form>
    <div class="row justify-content-center">
      <div class="col-4">
        <div class="form-outline">
          <label for="firstName" class="form-label">First name</label>
          <input
            type="text"
            class="form-control"
            id="firstName"
            v-model="firstName"
            placeholder="First name"
            required
          />
        </div>
      </div>
    </div>
    <div class="row justify-content-center">
      <div class="col-4">
        <div class="form-group">
          <label for="lastName" class="form-label">Last name</label>
          <input
            type="text"
            class="form-control"
            id="lastName"
            v-model="lastName"
            placeholder="Last name"
            required
          />
        </div>
      </div>
    </div>
    <div class="row justify-content-center">
      <div class="col-4">
        <div class="form-group">
          <label for="emailField">Email address</label>
          <input
            type="email"
            class="form-control"
            id="emailField"
            v-model="email"
            placeholder="Enter email"
            required
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
            v-model="password"
            placeholder="Password"
            minLength="8"
            required
          />
        </div>
      </div>
    </div>
    <div class="row justify-content-center">
      <div class="col-4">
        <div class="form-group">
          <label for="profilePicUpload">Upload a profile picture</label>
          <input
            type="file"
            class="form-control-file"
            id="profilePicUpload"
            @change="onFilePicked"
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
      <button
        type="button"
        class="btn btn-primary"
        @click="register"
        id="registerButton"
      >
        Register
      </button>
    </div>
  </form>
</template>

<script>
export default {
  data() {
    return {
      firstName: "",
      lastName: "",
      email: "",
      password: "",

      image: null,
      accecptedImageTypes: ["image/png", "image/jpeg", "image/gif"],

      errorText: "",
      showError: false,
      successText: "Account created!",
      showSuccess: false,
    };
  },
  methods: {
    async register() {
      this.showSuccess = false;

      if (localStorage.getItem("loggedIn") === 'true') {
        this.errorText = 'Log out to register a new account';
        this.showError = true;
        return;
      }  
      

      if (!this.validProperties()) {
        return;
      }

      try {
        await this.axios.post("/users/register", {
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.email,
          password: this.password,
        });

        const loginResponse = await this.axios.post("/users/login", {
          email: this.email,
          password: this.password,
        });

        localStorage.setItem("userId", loginResponse.data.userId);
        localStorage.setItem("token", loginResponse.data.token);
        localStorage.setItem("loggedIn", true);

        this.showError = false;
        this.showSuccess = true;
      } catch (err) {
        if (err.response == undefined || err.response.status == undefined) {
          console.log(err);
          this.errorText = "Something went wrong :(";
        } else if (err.response.status === 400) {
          this.errorText = "Email already in use";
        } else {
          this.errorText = err.resonse.data.message;
        }
        this.showError = true;
        return;
      }

      if (this.image != null && this.image != undefined) {
        try {
          await this.axios.put(`/users/${localStorage.getItem("userId")}/image`, this.image, {
            headers: {
                "X-Authorization": localStorage.getItem("token"),
                "Content-Type": this.image.type,
              },
          })
        } catch (err) {
          this.errorText = 'Could not upload image';
          this.showError = true;
          this.showSuccess = false;
        }
      }
    },
    validProperties() {
      if (
        this.validFirstName() &&
        this.validLastName() &&
        this.validEmail() &&
        this.validPassword() &&
        this.validImage()
      ) {
        this.showError = false;
        return true;
      } else {
        this.showError = true;
        return false;
      }
      
    },
    validFirstName() {
      if (this.firstName != null && this.firstName != undefined && this.firstName.length > 0) {
        return true;
      } else {
        this.errorText = "First name is required";
        return false;
      }
    },
    validLastName() {
      if (this.lastName != null && this.lastName != undefined && this.lastName.length > 0) {
        return true;
      } else {
        this.errorText = "Last name is required";
        return false;
      }
    },
    validPassword() {
      if (this.password != null && this.password != undefined && this.password.length > 0) {
        if (this.password.length >= 8) {
          return true;
        } else {
          this.errorText = "Password must be at least 8 characters long";
          return false;
        }
      } else {
        this.errorText = "Password is required";
        return false;
      }
    },
    validEmail() {
      const emailRegex = /^\S+@\S+$/;

      if (this.email != null && this.email != undefined && this.email.length > 0) {
        if (emailRegex.test(this.email)) {
          return true;
        } else {
          this.errorText = "Invalid email address";
          return false;
        }
      } else {
        this.errorText = "Email is required";
        return false;
      }
    },
    validImage() {
      if (
        this.image != null &&
        this.image != undefined &&
        !this.accecptedImageTypes.includes(this.image.type) 
      ) {
        this.errorText = "Image format not supported";
        return false;
      } else {
        return true;
      }
    },
    async onFilePicked(event) {
      const files = event.target.files;
      const fileReader = new FileReader();
      fileReader.addEventListener("load", () => {
        this.imageUrl = fileReader.result;
      });
      fileReader.readAsDataURL(files[0]);
      this.image = files[0];
    },
  },
};
</script>

<style scoped>
form {
  margin: 40px;
}
</style>