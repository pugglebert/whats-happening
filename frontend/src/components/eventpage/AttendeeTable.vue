<template>
  <div class="container">
    <div class="row">
      <div class="col-12">
        <table class="table">
          <thead>
            <tr>
              <th scope="col">Profile picture</th>
              <th scope="col">Name</th>
              <th scope="col">Role</th>
              <th v-if="organizerView" scope="col">Status</th>
            </tr>
          </thead>
          <tbody v-for="attendee of attendees" :key="attendee.attendeeId">
            <tr>
              <td class="w-25">
                <img
                  v-if="attendee.canReachImage"
                  :src="
                    axios.defaults.baseURL +
                    '/users/' +
                    attendee.attendeeId +
                    '/image'
                  "
                  class="rounded-circle"
                  width="80"
                  height="80"
                  alt=""
                />
                <img
                  v-else
                  src="@/assets/person-circle.svg"
                  class="rounded-circle"
                  width="80"
                  height="80"
                  alt=""
                />
              </td>
              <td>{{ attendee.firstName }} {{ attendee.lastName }}</td>
              <td>{{ attendee.role }}</td>
              <td v-if="organizerView">Pending</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "attendee-table",
  data() {
    return {
      organizerView: false,
    };
  },
  props: {
    attendees: [Object]
  }
};
</script>
