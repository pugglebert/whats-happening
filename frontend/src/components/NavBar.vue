<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <a class="navbar-brand" href="#" @click="home">Home</a>
    <ul v-if="loggedIn" class="navbar-nav ml-auto">
      <li>
        <button type="submit" class="btn btn-primary" @click="profile">
          Profile
        </button>
      </li>
      <li>
        <button type="submit" class="btn btn-primary" @click="myEvents">
          My events
        </button>
      </li>
      <li>
        <button type="submit" class="btn btn-primary" @click="createEvent">
          Create event
        </button>
      </li>
      <li>
        <button type="submit" class="btn btn-primary" @click="logout">
          Logout
        </button>
        <Logout v-if="showModal" @close="showModal = false" />
      </li>
    </ul>
    <ul v-if="!loggedIn" class="navbar-nav ml-auto">
      <li>
        <button class="btn btn-primary" type="submit" @click="login">
          Login
        </button>
      </li>
      <li>
        <button type="submit" class="btn btn-primary" @click="register">
          Register
        </button>
      </li>
    </ul>
  </nav>
</template>

<script>
import Logout from "./authentication/Logout";

export default {
  name: "nav-bar",
  components: {
    Logout,
  },
  data() {
    return {
      showModal: false,
      update: false,
    };
  },
  methods: {
    login() {
      if (localStorage.getItem("loggedIn") === 'false') {
        this.$router.push("/login");
      }
      this.update = !this.update;
    },
    register() {
      if (localStorage.getItem("loggedIn") === 'false') {
        this.$router.push("/register");
      }
      this.update = !this.update;
    },
    home() {
      this.$router.push("/");
      this.update = !this.update;
    },
    createEvent () {
      if (localStorage.getItem("loggedIn") === 'true') {
        this.$router.push("/create");
      }
      this.update = !this.update;
    },
    logout() {
      if (localStorage.getItem("loggedIn") === 'false') {
        this.update = !this.update;
        return;
      }
      this.axios
        .post(
          "/users/logout",
          {},
          {
            headers: {
              "X-Authorization": localStorage.getItem("token"),
            },
          }
        )
        .then(localStorage.setItem("loggedIn", false))
        .catch((err) => {
          if (err.response.status === 401) {
            localStorage.setItem("loggedIn", false);
          }
        });
      this.update = !this.update;
    },
    profile() {
      if (localStorage.getItem("loggedIn") === 'true') {
        this.$router.push(`/users/${localStorage.getItem("userId")}`);
      }
      this.update = !this.update;
    },
    myEvents() {
      if (localStorage.getItem("loggedIn") === 'true') {
        this.$router.push(`/users/${localStorage.getItem("userId")}/events`);
      }
      this.update = !this.update;
    }
  },
  computed: {
    loggedIn() {
      if (this.update) {
        return localStorage.getItem("loggedIn") === "true";
      } else {
        return localStorage.getItem("loggedIn") === "true";
      }
    },
  },
};
</script>

<style scoped>
input {
  margin: 10px;
}
button {
  margin: 10px;
}
form-check {
  display: flex;
  align-items: left;
}
</style>