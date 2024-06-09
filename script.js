// mount VUE instance
var app = new Vue({
    el: '#app',
    // data object
    data: {
        showProduct: true,
        lessons: [],
        // cart container array
        cart: [],
        // search term to be bounded from model
        searchTerm: '',
        //a user must provide “Name” and “Phone number” before can click on the checkout button (1%)
        username: '',
        phone: '',
        sortAttribute: 'subject',
        sortOrder: 'asc',
        baseURL:"https://cw2-backend-lyart.vercel.app/"
    },

    created() {
        this.getLessons();
    },

    // vue js app methods
    methods: {

        async getLessons() {
            // Using FETCH to send request to backend and retrieve list of lessons
            var res = await fetch(`${this.baseURL}collection/lessons`);
            this.lessons = await res.json();
        },

        async searchLessons() { //filter lessons from backend
            var query = `?search=${this.searchTerm}&sort=${this.sortAttribute}&order=${this.sortOrder}`
      
            var res = await fetch(`${this.baseURL}search/collection/lessons/${query}`);
            this.lessons = await res.json();
          },

        async submitOrder() {
            var order = {
                cart: [...this.cart],
                username: this.username,
                phone: this.phone,
            };

            // Update lessons
            this.cart.forEach((item) => {
                fetch(`${this.baseURL}collection/lessons/${item.lesson._id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ spaces: item.lesson.spaces }),
                });
            });

            // Save Order
            await fetch(`${this.baseURL}collection/orders`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(order),
            });
            alert('Order Submitted!')
            this.showCheckOut()
            this.cart = []
        },


        // add to cart method
        addToCart(lesson) {
            // push the product id to cart so as to search product by id and display it in cart page
            // check if lessons spaces is greater than zero
            if (lesson.spaces > 0) {
                // take one from total space
                lesson.spaces--
                // find current lesson object in cart
                var cartIndex = this.cart.findIndex(i => i.lesson === lesson)
                // if lesson is already in cart increment amount by 1 so as to prevent duplicates and save space and memory
                if (cartIndex > -1) {
                    this.cart[cartIndex].amount++
                } else {
                    // is lesson is not in cart add new lesson object
                    this.cart.push({
                        lesson: lesson,
                        amount: 1
                    })
                }
            }

        },
        removeProduct(lesson) {
            // remove product from cart container array
            const index = this.cart.findIndex(i => i.lesson === lesson)
            // check for last index 
            if (index !== -1) {
                // if lesson space already in cart deduct one amount 
                this.cart[index].amount--
                // add overall space when lesson is removed 
                lesson.spaces += 1;
                // else remove all lessons and update to original value
                if (this.cart[index].amount == 0) {
                    this.cart.splice(index, 1);
                }
            }
            // when a product is removed from cart add one back to space

        },
        // check for spaces
        // you cannot add a course more the number of space capacity it has. 
        checkItemCount(id) {
            itemCount = 0;
            for (i = 0; i < this.cart.length; i++) {
                // check for current instance of is
                if (this.cart[i] === id) {
                    itemCount += 1;
                }
            }
            return itemCount;
        },
        // check if to show checkout page
        showCheckOut() {
            this.showProduct = this.showProduct ? false : true;
        },

    },
    // computed values object
    computed: {
        // get cart length
        cartSize: function () {
            return this.cart.reduce((sum, lesson) => sum + lesson.amount, 0)
        },
        // check if product can be added to cart
        canAddToCart(lessons) {
            return this.lessons.spaces > this.checkItemCount(lessons.id);
        },
        // the use of this function is to validate the username and password.
        validateUserInfo() {
            return /^[a-zA-Z]+$/.test(this.username) && /^\d+$/.test(this.phone);
        }

    },
}
);