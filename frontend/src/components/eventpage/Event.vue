<template>
  <div class="container">
    <div class="d-flex justify-content-center">
      <div class="col">
        <div class="row justify-content-center">
          <div class="card text-center">
            <img
              v-if="canReachEventImage"
              :src="axios.defaults.baseURL + '/events/' + event.id + '/image'"
              class="card-image-top"
              alt=""
            />
            <img
              v-else
              src="@/assets/image.svg"
              class="card-image-top"
              alt=""
              width="500"
            />
            <div class="card-body">
              <h1 class="card-title">{{ event.title }}</h1>
              <h5 class="card-text">
                {{ event.dateString }} {{ event.timeString }}
              </h5>
              <p class="card-text">{{ event.description }}</p>
              <div class="card-text">
                <span class="font-weight-bold"> Venue: </span>
                <span> {{ event.venue }} </span>
              </div>
              <div class="card-text">
                <span class="font-weight-bold"> Categories: </span>
                <span> {{ event.categoryString }} </span>
              </div>
              <div class="card-text">
                <span class="font-weight-bold"> Fee: </span>
                <span> {{ fee }} </span>
              </div>
              <div class="card-text" v-if="event.url">
                <span class="font-weight-bold"> URL: </span>
                <span> {{ event.url }} </span>
              </div>
              <div class="card-text">
                <span class="font-weight-bold"> Attendees: </span>
                <span> {{ attendeeNum }} </span>
              </div>
              <div class="card-text">
                <span class="font-weight-bold"> Capacity: </span>
                <span> {{ event.capacity }} </span>
              </div>
              <div class="card-text">
                <span class="font-weight-bold"> Organizer: </span>
                <span>
                  {{ event.organizerFirstName }}
                  {{ event.organizerLastName }}</span
                >
              </div>
              <br />
              <div>
                <img
                  v-if="canReachOrganizerImage"
                  :src="
                    axios.defaults.baseURL +
                    '/users/' +
                    event.organizerId +
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
              </div>
              <br />
              <div>
                <button
                  v-if="canRequestAttendance"
                  class="btn btn-primary"
                  @click="registerForEvent"
                >
                  Request attendance
                </button>
              </div>
              <br v-if="canRequestAttendance" />
              <div>
                <button
                  v-if="canDeleteEvent"
                  class="btn btn-danger"
                  @click="showDelete"
                >
                  Delete event
                </button>
              </div>
              <br v-if="canDeleteEvent" />
              <div v-if="showError" class="alert alert-danger" role="alert">
                <div class="row justify-content-center">
                  {{ errorText }}
                </div>
                <br />
                <div class="row justify-content-center">
                  <button class="btn btn-light" @click="hideError">Ok</button>
                </div>
              </div>
              <div v-if="showSuccess" class="alert alert-success" role="alert">
                <div class="row justify-content-center">
                  {{ successText }}
                </div>
                <br />
                <div class="row justify-content-center">
                  <button class="btn btn-light" @click="hideSuccess">Ok</button>
                </div>
              </div>
              <div
                v-if="showDeleteConfirmation"
                class="alert alert-danger"
                role="alert"
              >
                <div class="row justify-content-center">
                  Are you sure you want to delete this event?
                </div>
                <br />
                <div class="row justify-content-center">
                  <button class="btn btn-light" @click="confirmDelete">
                    Confirm
                  </button>
                  <button class="btn btn-light" @click="cancelDelete">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <br />
        <div class="row justify-content-center">
          <h2>Attendees</h2>
        </div>
        <div class="row justify-content-center">
          <div class="col">
            <AttendeeTable :attendees="attendees1" />
          </div>
          <div class="col">
            <AttendeeTable :attendees="attendees2" />
          </div>
        </div>
        <br />
        <div class="row justify-content-center">
          <h2>Similar events</h2>
        </div>
        <div class="row justify-content-center">
          <EventTable :events="similarEvents" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import EventTable from "../reusable/EventTable";
import AttendeeTable from "./AttendeeTable";

export default {
  data() {
    return {
      event: {},
      attendees1: [],
      attendees2: [],
      similarEvents: [],
      canReachEventImage: false,
      canReachOrganizerImage: false,
      categories: [],

      showError: false,
      errorText: "",
      showSuccess: false,
      succesText: "",
      showDeleteConfirmation: false,
    };
  },
  components: {
    EventTable,
    AttendeeTable,
  },
  watch: {
    $route: {
      async handler() {
        const id = parseInt(this.$route.params.id);
        let response;
        try {
          response = await this.axios.get(`/events/${id}`);
          this.event = response.data;
          const date = new Date(this.event.date);
          this.event.dateString = date.toDateString();
          this.event.timeString = date.toTimeString().substring(0, 5);
          await this.getCategoryNames();
          await this.getAttendess();
          await this.getSimilarEvents();
          await this.checkImagesReachable();
          await this.addSimilarEventInfo();
        } catch (err) {
          this.$router.push('/events/notfound');
        }
      },
      immediate: true,
    },
  },
  computed: {
    fee() {
      if (this.event.fee && this.event.fee != 0) {
        return this.event.fee;
      } else {
        return "Free";
      }
    },
    attendeeNum() {
      if (this.event.attendeeCount) {
        return this.event.attendeeCount;
      } else {
        return 0;
      }
    },
    canRequestAttendance() {
      const eventDate = new Date(this.event.date);
      if (eventDate < new Date()) {
        return false;
      }
      if (
        this.event.capacity != null &&
        this.event.capacity != undefined &&
        this.attendeeNum >= this.event.capacity
      ) {
        return false;
      }
      if (localStorage.getItem("loggedIn") === "true") {
        for (let attendee of this.attendees1) {
          console.log(localStorage.getItem("userId"));
          console.log(attendee.attendeeId);
          if (
            attendee.attendeeId === parseInt(localStorage.getItem("userId"))
          ) {
            return false;
          }
        }
        for (let attendee of this.attendees2) {
          if (
            attendee.attendeeId === parseInt(localStorage.getItem("userId"))
          ) {
            return false;
          }
        }
      }
      return true;
    },
    canDeleteEvent() {
      if (
        localStorage.getItem("loggedIn") === "true" &&
        this.event.organizerId === parseInt(localStorage.getItem("userId"))
      ) {
        return true;
      }
      return false;
    },
  },
  methods: {
    async getCategoryNames() {
      const categoryResponse = await this.axios.get("/events/categories");
      this.categories = categoryResponse.data;
      const categoryNames = [];
      for (let categoryId of this.event.categories) {
        for (let category of this.categories) {
          if (category.id === categoryId) {
            categoryNames.push(category.name);
            break;
          }
        }
      }
      let categoryString = categoryNames.join(", ");
      this.event.categoryString = categoryString;
    },
    async getAttendess() {
      let attendees;
      try {
        const response = await this.axios.get(
          `/events/${this.event.id}/attendees`
        );
        attendees = response.data;
        for (let attendee of attendees) {
          if (attendee.attendeeId == this.event.organizerId) {
            attendee.role = "Organizer";
          } else {
            attendee.role = "Attendee";
          }

          await this.axios
            .get(`/users/${attendee.attendeeId}/image`)
            .then(() => {
              attendee.canReachImage = true;
            })
            .catch(() => {
              attendee.canReachImage = false;
            });
        }
      } catch (err) {
        attendees = [];
      }
      const attendeeNum = attendees.length;
      this.attendees1 = attendees.slice(0, Math.ceil(attendeeNum / 2));
      this.attendees2 = attendees.slice(
        Math.ceil(attendeeNum / 2),
        attendeeNum
      );
    },
    async getSimilarEvents() {
      this.similarEvents = [];
      let eventParams = new URLSearchParams();
      for (let categoryId of this.event.categories) {
        eventParams.append("categoryIds", categoryId);
      }
      const similarEventsResponse = await this.axios.get("/events", {
        params: eventParams,
      });
      for (let event of similarEventsResponse.data) {
        if (event.eventId !== this.event.id) {
          this.similarEvents.push(event);
        }
      }
    },
    async addSimilarEventInfo() {
      for (let event of this.similarEvents) {
        const eventDate = new Date(event.date);
        event.dateString = eventDate.toDateString();
        event.timeString = eventDate.toTimeString().substring(0, 5);

        const categoryNames = [];
        for (let categoryId of event.categories) {
          for (let category of this.categories) {
            if (category.id === categoryId) {
              categoryNames.push(category.name);
              break;
            }
          }
        }
        event.categoryNames = categoryNames;

        await this.axios
          .get(`/events/${event.eventId}`)
          .then((response) => {
            event.organizerId = response.data.organizerId;
          })
          .catch(() => {
            event.organizerId = null;
          });

        this.axios
          .get(`/events/${event.eventId}/image`)
          .then(() => {
            event.canReachEventImage = true;
          })
          .catch(() => {
            event.canReachEventImage = false;
          });

        this.axios
          .get(`/users/${event.organizerId}/image`)
          .then(() => {
            event.canReachOrganizerImage = true;
          })
          .catch(() => {
            event.canReachOrganizerImage = false;
          });
      }
    },
    async checkImagesReachable() {
      this.axios
        .get(`/events/${this.event.id}/image`)
        .then(() => (this.canReachEventImage = true))
        .catch(() => (this.canReachEventImage = false));

      this.axios
        .get(`/users/${this.event.organizerId}/image`)
        .then(() => (this.canReachOrganizerImage = true))
        .catch(() => (this.canReachOrganizerImage = false));
    },
    async registerForEvent() {
      this.showSuccess = false;
      this.showError = false;
      await this.axios
        .post(
          `/events/${this.event.id}/attendees`,
          {},
          {
            headers: {
              "X-Authorization": localStorage.getItem("token"),
            },
          }
        )
        .then(() => {
          if (this.event.requiresAttendanceControl) {
            this.successText =
              "You have registered your interest for this event!";
          } else {
            this.successText = "You are registered to attend this event!";
          }
          this.showSuccess = true;
        })
        .catch((err) => {
          if (
            err == undefined ||
            err.response == undefined ||
            err.response.status == undefined
          ) {
            this.errorText = "Could not register you for this event";
          } else if (err.response.status === 401) {
            this.errorText = "You need to log in to register for an event";
          } else if (err.response.status === 403) {
            this.errorText =
              "You cannot register for an event you are already attending";
          } else {
            this.errorText = "Could not register you for this event";
          }
          this.showError = true;
        });

      await this.getAttendess();
      const eventResponse = await this.axios.get(`/events/${this.event.id}`);
      this.event.attendeeCount = eventResponse.data.attendeeCount;
    },
    hideSuccess() {
      this.showSuccess = false;
    },
    hideError() {
      this.showError = false;
    },
    showDelete() {
      this.showDeleteConfirmation = true;
    },
    cancelDelete() {
      this.showDeleteConfirmation = false;
    },
    async confirmDelete() {
      this.showError = false;
      this.showSuccess = false;
      this.showDeleteConfirmation = false;
      this.axios
        .delete(`/events/${this.event.id}`, {
          headers: {
            "X-Authorization": localStorage.getItem("token"),
          },
        })
        .then(() => (this.$router.push('/event/notfound')))
        .catch((err) => {
          if (
            err == undefined ||
            err.response == undefined ||
            err.response.status == undefined
          ) {
            this.errorText = "Could not delete event";
          } else if (err.status === 401) {
            this.errorText = "You are not logged in";
            localStorage.setItem("loggedIn", false);
          } else if (err.status === 403) {
            this.errorText = "Only the organizer of this event can delele it";
          } else {
            this.errorText = "Could not delete event";
          }
          this.showError = true;
        });
    },
  },
};
</script>

<style scoped>

button {
  margin: 10px;
}

</style>