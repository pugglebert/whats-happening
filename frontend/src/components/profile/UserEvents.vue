<template>
  <div class="container" v-if="loggedIn">
    <br />
    <div class="d-flex justify-content-center">
      <h3>Events I'm organizing</h3>
    </div>
    <div class="d-flex justify-content-center">
      <event-table :events="organizedEvents" />
    </div>
    <br />
    <div class="d-flex justify-content-center">
      <h3>My attendance requests</h3>
    </div>
    <div class="d-flex justify-content-center">
      <event-table :events="attendanceRequests" :showStatus="true" />
    </div>
  </div>
</template>

<script>
import EventTable from "../reusable/EventTable.vue";

export default {
  components: { EventTable },
  name: "UserEvents",
  data() {
    return {
      userId: null,
      organizedEvents: [],
      attendanceRequests: [],
    };
  },
  watch: {
    $route: {
      async handler() {
        this.userId = parseInt(this.$route.params.id);
        await this.getMyEvents();
      },
      immediate: true,
    },
  },
  computed: {
    loggedIn() {
      return localStorage.getItem("loggedIn") === "true";
    },
  },
  methods: {
    async getMyEvents() {
      const categoryResponse = await this.axios.get("/events/categories");
      const eventResponse = await this.axios.get("/events");
      const categories = categoryResponse.data;
      const organizedEvents = [];
      const attendanceRequests = [];
      for (let event of eventResponse.data) {
        const categoryNames = [];
        for (let categoryId of event.categories) {
          for (let category of categories) {
            if (category.id === categoryId) {
              categoryNames.push(category.name);
              break;
            }
          }
        }
        event.categoryNames = categoryNames;

        const fullEventResponse = await this.axios.get(
          `/events/${event.eventId}`
        );

        event.organizerId = fullEventResponse.data.organizerId;

        await this.axios
          .get(`/events/${event.eventId}/image`)
          .then(() => (event.canReachEventImage = true))
          .catch(() => (event.canReachEventImage = false));

        await this.axios
          .get(`/users/${event.organizerId}/image`)
          .then(() => (event.canReachOrganizerImage = true))
          .catch(() => (event.canReachOrganizerImage = false));

        const eventDate = new Date(event.date);
        event.dateString = eventDate.toDateString();
        event.timeString = eventDate.toTimeString().substring(0, 5);

        if (fullEventResponse.data.organizerId === this.userId) {
          organizedEvents.push(event);
        }
        event.organizerId = fullEventResponse.data.organizerId;
        const attendeeResponse = await this.axios.get(
          `events/${event.eventId}/attendees`,
          {
            headers: {
              "X-Authorization": localStorage.getItem("token"),
            },
          }
        );
        for (let attendee of attendeeResponse.data) {
          if (attendee.attendeeId === this.userId) {
            event.status =
              attendee.status.charAt(0).toUpperCase() +
              attendee.status.slice(1);
            attendanceRequests.push(event);
          }
        }
      }
      this.organizedEvents = organizedEvents;
      this.attendanceRequests = attendanceRequests;
    },
  },
};
</script>
