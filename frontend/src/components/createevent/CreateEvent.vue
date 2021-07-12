<template>
  <form>
    <div class="row justify-content-center">
      <div class="col-4">
        <div class="form-outline">
          <label for="title" class="form-label">Title *</label>
          <input
            type="text"
            class="form-control"
            id="title"
            v-model="title"
            placeholder="Title"
            required
          />
        </div>
      </div>
    </div>
    <br />
    <div class="row justify-content-center">
      <div class="col-2">
        <div>
          <label for="date">Event date *</label>
          <input type="date" id="date" v-model="date" required />
        </div>
      </div>
      <div class="col-2">
        <div>
          <label for="time">Event time *</label>
          <input type="time" id="time" v-model="time" required />
        </div>
      </div>
    </div>
    <br />
    <div class="row justify-content-center">
      <div class="col-4">
        <div class="dropdown align-bottom">
          <button
            class="btn btn-primary dropdown-toggle"
            type="button"
            id="dropdownMenuButton"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            Categories *
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
      </div>
    </div>
    <br />
    <div class="row justify-content-center">
      <div class="col-4">
        <div class="form-group">
          <label for="imageUpload">Upload a hero image</label>
          <input
            type="file"
            class="form-control-file"
            id="imageUpload"
            @change="onFilePicked"
          />
        </div>
      </div>
    </div>
    <div class="row justify-content-center">
      <div class="col-4">
        <div class="form-outline">
          <label for="description" class="form-label">Description *</label>
          <textarea
            class="form-control"
            id="description"
            rows="3"
            v-model="description"
            required
          ></textarea>
        </div>
      </div>
    </div>
    <br />
    <div class="row justify-content-center">
      <div class="col-2">
        <div class="form-check">
          <input
            class="form-check-input"
            type="checkbox"
            value=""
            id="attendanceControlCheckbox"
            v-model="online"
          />
          <label class="form-check-label" for="flexCheckDefault">
            Online event
          </label>
        </div>
      </div>
      <div class="col-2">
        <div class="form-check">
          <input
            class="form-check-input"
            type="checkbox"
            value=""
            id="attendanceControlCheckbox"
            v-model="requireAttendanceControl"
          />
          <label class="form-check-label" for="flexCheckDefault">
            Require attendance control
          </label>
        </div>
      </div>
    </div>
    <br />
    <div class="row justify-content-center">
      <div class="col-4">
        <div class="form-outline">
          <label v-if="online" for="url" class="form-label">URL *</label>
          <label v-else for="url" class="form-label">URL</label>
          <input
            type="url"
            class="form-control"
            id="url"
            v-model="url"
            placeholder="URL"
          />
        </div>
      </div>
    </div>
    <br v-if="!online" />
    <div v-if="!online" class="row justify-content-center">
      <div class="col-4">
        <div class="form-outline">
          <label for="venue" class="form-label">Venue *</label>
          <input
            type="text"
            class="form-control"
            id="venue"
            v-model="venue"
            placeholder="Venue"
          />
        </div>
      </div>
    </div>
    <br />
    <div class="row justify-content-center">
      <div class="col-2">
        <div class="form-outline">
          <label for="fee" class="form-label">Fee (NZD)</label>
          <input
            type="text"
            class="form-control"
            id="fee"
            v-model="fee"
            placeholder="0"
          />
        </div>
      </div>
      <div class="col-2">
        <div class="form-outline">
          <label for="capacity" class="form-label">Capacity</label>
          <input
            type="number"
            class="form-control"
            id="capacity"
            v-model="capacity"
            placeholder="0"
          />
        </div>
      </div>
    </div>
    <br />

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
        @click="create"
        id="createButton"
      >
        Create
      </button>
    </div>
  </form>
</template>

<script>
import "bootstrap/dist/js/bootstrap.bundle";

export default {
  data() {
    return {
      title: "",
      categories: [],
      date: null,
      time: null,
      requireAttendanceControl: false,
      online: false,
      url: "",
      venue: "",
      fee: null,
      capacity: null,
      description: "",
      image: null,
      accecptedImageTypes: ["image/png", "image/jpeg", "image/gif"],

      showError: false,
      errorText: "",
      showSuccess: false,
      successText: "Event created!",
    };
  },
  mounted() {
    this.getCategories();
  },
  methods: {
    getCategories() {
      this.categories = [];
      this.axios.get("/events/categories").then((response) => {
        for (let category of response.data) {
          category.selected = false;
          this.categories.push(category);
        }
      });
    },
    async create() {
      this.showSuccess = false;
      if (this.validProperties()) {
        const body = this.getBody();
        try {
          const response = await this.axios.post("/events", body, {
            headers: {
              "X-Authorization": localStorage.getItem("token"),
            },
          });

          this.showError = false;
          this.showSuccess = true;

          if (this.image != null && this.image != undefined) {
            try {
              await this.axios.put(
                `/events/${response.data.eventId}/image`,
                this.image,
                {
                  headers: {
                    "X-Authorization": localStorage.getItem("token"),
                    "Content-Type": this.image.type,
                  },
                }
              );
            } catch (err) {
              this.errorText = "Could not upload image";
              this.showError = true;
              this.showSuccess = false;
            }
          }
        } catch (err) {
          if (err.response == undefined) {
            this.errorText = "Something went wrong :(";
          } else if (err.response.status === 500) {
            this.errorText = "Event title already in use";
          } else if (err.response.status === 401) {
            this.errorText = "You must be logged in to create an event";
            localStorage.setItem("loggedIn", false);
          } else {
            this.errorText = err.resonse.data.message;
          }
          this.showError = true;
        }
      }
    },
    validProperties() {
      if (
        this.validTitle() &&
        this.validDatetime() &&
        this.validCategories() &&
        this.validImage() &&
        this.validDescription() &&
        this.validUrl() &&
        this.validVenue() &&
        this.validFee() &&
        this.validCapacity()
      ) {
        this.showError = false;
        return true;
      } else {
        this.showError = true;
        return false;
      }
    },
    getBody() {
      let body = {
        title: this.title,
        description: this.description,
        categoryIds: [],
        date: this.date + " " + this.time,
        requireAttendanceControl: this.requireAttendanceControl,
        isOnline: this.online,
      };
      for (let category of this.categories) {
        if (category.selected === true) {
          body.categoryIds.push(category.id);
        }
      }
      if (this.url != null && this.url != undefined && this.url.length > 0) {
        body.url = this.url;
      }
      if (
        this.venue != null &&
        this.venue != undefined &&
        this.venue.length > 0
      ) {
        body.venue = this.venue;
      }
      if (this.capacity != null && this.capacity != undefined) {
        body.capacity = parseInt(this.capacity);
      }
      if (this.fee != null && this.fee != undefined) {
        body.fee = parseFloat(this.fee);
      }
      return body;
    },
    validTitle() {
      if (this.title && this.title.length > 0) {
        return true;
      } else {
        this.errorText = "Title is required";
        return false;
      }
    },
    validDatetime() {
      if (!this.date) {
        this.errorText = "Date is required";
        return false;
      } else if (!this.time) {
        this.errorText = "Time is required";
        return false;
      } else if (new Date(this.date + " " + this.time) <= new Date()) {
        this.errorText = "Date must be in the future";
        return false;
      }
      return true;
    },
    validDescription() {
      if (this.description && this.description.length > 0) {
        return true;
      } else {
        this.errorText = "Description is required";
        return false;
      }
    },
    validCapacity() {
      if (
        this.capacity != null &&
        this.capacity != undefined &&
        this.capacity < 0
      ) {
        this.errorText = "Capacity cannot be negative";
        return false;
      } else {
        return true;
      }
    },
    validFee() {
      const feeRegex = /^\d+\.?\d{0,2}$/;
      if (
        this.fee != null &&
        this.fee != undefined &&
        !feeRegex.test(this.fee)
      ) {
        this.errorText = "Fee must be a numerical price";
        return false;
      } else {
        return true;
      }
    },
    validCategories() {
      for (let category of this.categories) {
        if (category.selected === true) {
          return true;
        }
      }
      this.errorText = "Select at least one category";
      return false;
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
    validUrl() {
      if (this.online === true) {
        if (this.url != null && this.url != undefined && this.url.length > 0) {
          return true;
        } else {
          this.errorText = "URL is required for online events";
          return false;
        }
      }
      return true;
    },
    validVenue() {
      if (this.online === false) {
        if (this.venue != null && this.venue != undefined && this.venue.length > 0) {
          return true;
        } else {
          this.errorText = "Venue is required for in person events";
          return false;
        }
      }
      return true;
    },
    onFilePicked(event) {
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