<template>
  <div class="modal" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Confirm logout</h5>
          <button
            type="button"
            class="close"
            data-dismiss="modal"
            aria-label="Close"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to logout?</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" @click="confirmLogout">
            Yes
          </button>
          <button type="button" class="btn btn-secondary" data-dismiss="modal">
            No
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import "bootstrap/dist/js/bootstrap.bundle";

export default {
  name: "logout-modal",
  methods: {
    confirmLogout() {
      this.axios.post("/users/logout", {
        headers: {
          "X-Authorization": localStorage.getItem("token"),
        },
      })
      .then(localStorage.setItem("loggedIn", false));
    },
  },
};
</script>
