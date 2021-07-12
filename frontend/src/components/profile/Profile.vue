<template>
  <div class="container" v-if="loggedIn">
    <div class="d-flex justify-content-center">
      <div class="col">
        <div class="row justify-content-center">
          <div class="card text-center">
            <img
              v-if="canReachImage"
              :src="axios.defaults.baseURL + '/users/' + user.id + '/image'"
              class="card-image-top"
              alt=""
            />
            <img
              v-else
              src="@/assets/person-circle.svg"
              class="card-image-top"
              alt=""
              width="500"
            />
            <div class="card-body">
              <h5 class="card-title">
                {{ user.firstName }} {{ user.lastName }}
              </h5>
              <div class="card-text">
                <span class="font-weight-bold"> Email: </span>
                <span> {{ user.email }} </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "profile",
  data() {
    return {
      user: {},
      canReachImage: false,
    };
  },
  watch: {
    $route: {
      async handler() {
        const id = parseInt(this.$route.params.id);
        const response = await this.axios.get(`/users/${id}`, {
          headers: {
            "X-Authorization": localStorage.getItem("token"),
          },
        });
        this.user = response.data;
        this.user.id = id;
        await this.axios
          .get(`/users/${id}/image`)
          .then(() => (this.canReachImage = true))
          .catch(() => (this.canReachImage = false));
      },
      immediate: true,
    },
  },
  computed: {
    loggedIn() {
      return localStorage.getItem("loggedIn") === "true";
    },
  },
};
</script>
