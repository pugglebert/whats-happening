<template>
  <div class="container">
    <div class="row">
      <div class="col-12">
        <table class="table table-hover">
          <thead>
            <tr>
              <th scope="col">Title</th>
              <th scope="col">Image</th>
              <th scope="col">Organzier</th>
              <th scope="col">Attendees</th>
              <th scope="col">Date</th>
              <th scope="col">Time</th>
              <th scope="col">Categories</th>
              <th v-if="showStatus" scope="col">Status</th>
            </tr>
          </thead>
          <tbody v-for="event in events" :key="event.eventId">
            <tr @click="goToEvent(event.eventId)">
              <td>{{ event.title }}</td>
              <td class="w-25">
                <img
                  v-if="event.canReachEventImage"
                  :src="
                    axios.defaults.baseURL +
                    '/events/' +
                    event.eventId +
                    '/image'
                  "
                  class="img-fluid img-thumbnail"
                  style="min-width: 100px;"
                  alt=""
                />
                <img
                  v-else
                  src="@/assets/image.svg"
                  class="img-fluid img-thumbnail"
                  width="200"
                  style="min-width: 100px;"
                  alt=""
                />
              </td>
              <td>
                <img
                  v-if="event.canReachOrganizerImage"
                  :src="
                    axios.defaults.baseURL +
                    '/users/' +
                    event.organizerId +
                    '/image'
                  "
                  class="rounded-circle"
                  width=60
                  height=60
                  alt=""
                />
                <img
                  v-else
                  src="@/assets/person-circle.svg"
                  class="rounded-circle"
                  width=60
                  height=60
                  alt=""
                />
                <p>
                  {{ event.organizerFirstName }} {{ event.organizerLastName }}
                </p>
              </td>
              <td>{{ event.numAcceptedAttendees }}</td>
              <td>{{ event.dateString }}</td>
              <td>{{ event.timeString }}</td>
              <td>
                <li v-for="name in event.categoryNames" :key="name">
                  {{ name }}
                </li>
              </td>
              <td v-if="showStatus"> {{ event.status }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "event-table",
  props: {
    events: [Object],
    showStatus: Boolean,
  },
  mounted: async function () {

  },
  methods: {
    goToEvent(id) {
      this.$router.push(`/events/${id}`);
    },
    async setOrganizers() {
      for (let event of this.events) {
        const fullEventInfo = await this.axios.get(`/events/${event.eventId}`);
        console.log(fullEventInfo.data);
        event.organizerId = fullEventInfo.data.organizerId;
      }
    },
    async setCategories() {
      const categories = await this.axios.get("/events/categories");
      for (let event of this.events) {
        event.categoryNames = [];
        for (let categoryId of event.categories) {
          for (let category of categories) {
            if (category.id === categoryId) {
              event.categoryNames.push(category.name);
              break;
            }
          }
        }
      }
    },
    setDateTime() {
      for (let event of this.events) {
        const eventDate = new Date(event.date);
        event.dateString = eventDate.toDateString();
        event.timeString = eventDate.toTimeString().substring(0, 5);
      }
    },
  },
};
</script>
