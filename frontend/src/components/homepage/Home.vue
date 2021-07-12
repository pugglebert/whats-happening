<template>
  <div class="container">
    <div class="d-flex">
      <form class="form-inline">
        <div>
          <input
            class="form-control"
            type="search"
            v-model="searchTerm"
            placeholder="Search"
            aria-label="Search"
          />
          <button class="btn btn-primary" type="button" @click="search">
            Search
          </button>
        </div>
        <div class="form-group">
          <select
            class="form-control"
            id="orderSelect"
            v-model="selectedOrderQuery"
          >
            <option value="" selected disabled>Order by...</option>
            <option
              v-for="order in orders"
              :key="order.id"
              :value="order.query"
            >
              {{ order.name }}
            </option>
          </select>
        </div>
        <div class="dropdown">
          <button
            class="btn btn-primary dropdown-toggle"
            type="button"
            id="dropdownMenuButton"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            Categories
          </button>
          <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
            <li
              v-for="category in categories"
              :key="category.id"
              class="dropdown-item"
            >
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  v-model="category.selected"
                  id="categoryCheck"
                />
                <label class="form-check-label" for="categoryCheck">
                  {{ category.name }}
                </label>
              </div>
            </li>
          </div>
        </div>
        <button type="button" class="btn btn-primary" @click="apply">
          Apply
        </button>
        <button type="button" class="btn btn-primary" @click="clear">
          Clear
        </button>
      </form>
    </div>
    <event-table :events="pageEvents" />
    <div class="d-flex justify-content-center">
      <label class="font-weight-bold"
        >Page {{ pageNum }} of {{ maxPageNum }}</label
      >
    </div>
    <div class="d-flex justify-content-center">
      <div
        class="btn-group justify-content-center"
        role="group"
        id="paginationButtons"
      >
        <button type="button" class="btn btn-secondary" @click="first">
          &laquo; First
        </button>
        <button type="button" class="btn btn-secondary" @click="previous">
          &lt; Previous
        </button>
        <button type="button" class="btn btn-secondary" @click="next">
          Next &gt;
        </button>
        <button type="button" class="btn btn-secondary" @click="last">
          Last &raquo;
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import "bootstrap/dist/js/bootstrap.bundle";
import EventTable from "../reusable/EventTable.vue";

export default {
  name: "Home",
  components: {
    EventTable,
  },
  data() {
    return {
      user: null,
      searchTerm: "",
      categories: [],
      categoryFilters: [],
      defaultOrderQuery: "DATE_ASC",
      orders: [
        { id: 1, name: "Date (closest first)", query: "DATE_ASC" },
        { id: 2, name: "Date (latest first)", query: "DATE_DESC" },
        { id: 3, name: "Attendees (low to high)", query: "ATTENDEES_ASC" },
        { id: 4, name: "Attendees (high to low)", query: "ATTENDEES_DESC" },
      ],
      selectedOrderQuery: "",
      events: [],
      numEvents: 0,
      pageNum: 1,
      pageEvents: [],
      maxPageNum: 1,
    };
  },
  created: async function () {
    await this.getCategories();
    await this.setEvents();
  },
  methods: {
    login() {
      this.$router.push("/login");
    },
    register() {
      this.$router.push("/register");
    },
    home() {
      this.$router.push("/");
    },
    async apply() {
      this.categoryFilters = [];
      for (let category of this.categories) {
        if (category.selected === true) {
          this.categoryFilters.push(category.id);
        }
      }
      await this.setEvents();
    },
    async clear() {
      this.searchTerm = "";
      this.categoryFilters = [];
      this.selectedOrderQuery = this.defaultOrderQuery;
      await this.setEvents();
    },
    async search() {
      await this.setEvents();
    },
    profile() {},
    logout() {},
    first() {
      this.pageNum = 1;
      this.pageinateEvents();
    },
    next() {
      this.pageNum += 1;
      this.pageinateEvents();
    },
    previous() {
      this.pageNum -= 1;
      this.pageinateEvents();
    },
    last() {
      this.pageNum = Math.ceil(this.numEvents / 10);
      this.pageinateEvents();
    },
    async setEvents() {
      await this.getEvents();
      await this.addEventInfo();
      this.pageinateEvents();
    },
    async getEvents() {
      this.events = [];
      let eventParams = new URLSearchParams();
      if (this.searchTerm && this.searchTerm.length > 0) {
        eventParams.append("q", this.searchTerm);
      }
      if (this.categoryFilters && this.categoryFilters.length > 0) {
        for (let filter of this.categoryFilters) {
          eventParams.append("categoryIds", filter);
        }
      }
      if (this.selectedOrderQuery && this.selectedOrderQuery.length > 0) {
        eventParams.append("sortBy", this.selectedOrderQuery);
      } else {
        eventParams.append("sortBy", this.defaultOrderQuery);
      }
      const eventResponse = await this.axios.get("/events", {
        params: eventParams,
      });
      this.events = eventResponse.data;
      this.numEvents = this.events.length;
    },
    async getCategories() {
      const categoryResponse = await this.axios.get("/events/categories");
      this.categories = categoryResponse.data;
      for (let category of this.categories) {
        category.selected = false;
      }
    },
    async addEventInfo() {
      for (let event of this.events) {
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
          .catch(() => (event.organizerId = null));

        this.axios
          .get(`/events/${event.eventId}/image`)
          .then(() => (event.canReachEventImage = true))
          .catch(() => (event.canReachEventImage = false));

        this.axios
          .get(`/users/${event.organizerId}/image`)
          .then(() => (event.canReachOrganizerImage = true))
          .catch(() => (event.canReachOrganizerImage = false));
      }
    },
    async setOrganizers() {
      for (let event of this.events) {
        const fullEventInfo = await this.axios.get(`/events/${event.eventId}`);
        event.organizerId = fullEventInfo.data.organizerId;
      }
    },
    pageinateEvents() {
      this.maxPageNum = Math.max(1, Math.ceil(this.numEvents / 10));
      if (this.pageNum > this.maxPageNum) {
        this.pageNum = this.maxPageNum;
      }
      if (this.pageNum < 1) {
        this.pageNum = 1;
      }
      const startIndex = (this.pageNum - 1) * 10;
      const endIndex = Math.min(startIndex + 10, this.numEvents);
      this.pageEvents = this.events.slice(startIndex, endIndex);
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