// The catalog and slideshow both use this product list.
const products = [
	{
		id: "calculus-textbook",
		name: "Calculus Textbook (11th Ed)",
		category: "Textbooks",
		price: 2500,
		image: "img2.jpeg",
		alt: "Used Calculus textbook with a blue cover, KES 2,500",
		description: "Hardcover edition in excellent condition with minimal highlighting. Perfect for MAT101."
	},
	{
		id: "scientific-calculator",
		name: "Scientific Calculator & Note Pad",
		category: "Essentials",
		price: 1800,
		image: "img1.jpeg",
		alt: "Scientific calculator with a number keypad for coursework, KES 1,800",
		description: "Casio fx-991EX. Works perfectly, solar/battery powered, and ready for engineering or maths courses."
	},
	{
		id: "desk-chair",
		name: "Ergonomic Desk Chair",
		category: "Furniture",
		price: 4500,
		image: "img4.jpeg",
		alt: "Ergonomic desk chair with an adjustable seat and breathable mesh back, KES 4,500",
		description: "Adjustable height with a breathable mesh back. Lightweight and comfortable for study sessions."
	},
	{
		id: "wireless-earbuds",
		name: "Wireless Bluetooth Earbuds",
		category: "Tech",
		price: 3000,
		image: "img3.jpeg",
		alt: "Wireless Bluetooth earbuds with a charging case, KES 3,000",
		description: "Noise-isolating in-ear headphones with a charging case, long battery life, and a clear microphone."
	}
];

function formatPrice(price) {
	return new Intl.NumberFormat("en-KE").format(price);
}

function validateQuantity(value) {
	const text = String(value).trim();
	if (!/^\d+$/.test(text) || Number(text) < 1) {
		return { valid: false, message: "Quantity must be a whole number greater than 0" };
	}

	const quantity = Number(text);
	if (!Number.isSafeInteger(quantity)) {
		return { valid: false, message: "Quantity is too large" };
	}

	return { valid: true, message: "", value: quantity };
}

function showFieldError(field, errorElement, message) {
	field.setAttribute("aria-invalid", String(Boolean(message)));
	errorElement.textContent = message;
	if (message) {
		errorElement.classList.add("is-visible");
	} else {
		errorElement.classList.remove("is-visible");
	}
}

function playSuccessAnimation(element) {
	element.classList.remove("is-visible");
	void element.offsetWidth;
	element.classList.add("is-visible");
}

function setupCatalog() {
	const grid = document.querySelector("#product-grid");
	if (!grid) return;

	const searchInput = document.querySelector("#product-search");
	const categoryFilter = document.querySelector("#category-filter");
	const gallery = document.querySelector("#product-gallery");
	const galleryEmpty = document.querySelector("#gallery-empty");
	const noResults = document.querySelector("#no-results");
	const slideCount = document.querySelector("#slide-count");
	const previousButton = document.querySelector("#previous-slide");
	const nextButton = document.querySelector("#next-slide");
	const cartButton = document.querySelector(".cart-button");
	const cartCount = document.querySelector(".cart-count");
	const cartTotalDisplay = document.querySelector("#cart-total");
	let visibleProducts = products;
	let slideshowIndex = 0;
	let numberOfCartItems = 0;
	const cartItems = new Map();

	function renderGallery() {
		const product = visibleProducts[slideshowIndex];
		gallery.replaceChildren();
		galleryEmpty.hidden = Boolean(product);
		gallery.hidden = !product;
		slideCount.textContent = `${product ? slideshowIndex + 1 : 0} / ${visibleProducts.length}`;
		previousButton.disabled = visibleProducts.length < 2;
		nextButton.disabled = visibleProducts.length < 2;

		if (!product) return;

		const slide = document.createElement("article");
		slide.className = "gallery-slide";
		slide.innerHTML = `
			<img src="${product.image}" alt="${product.alt}">
			<div class="gallery-slide-copy">
				<p class="eyebrow">${product.category}</p>
				<h3>${product.name}</h3>
				<p>${product.description}</p>
				<strong>KES ${formatPrice(product.price)}</strong>
			</div>`;
		gallery.append(slide);
	}

	function renderProducts() {
		const searchTerm = searchInput.value.trim().toLowerCase();
		const selectedCategory = categoryFilter.value;
		visibleProducts = products.filter((product) => {
			const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
			const matchesSearch = `${product.name} ${product.description} ${product.category}`
				.toLowerCase().includes(searchTerm);
			return matchesCategory && matchesSearch;
		});

		slideshowIndex = 0;
		grid.replaceChildren();
		visibleProducts.forEach((product) => {
			const card = document.createElement("article");
			card.className = "product-card";
			card.innerHTML = `
				<div class="product-image-wrapper">
					<img src="${product.image}" alt="${product.alt}">
				</div>
				<p class="product-category">${product.category}</p>
				<h2 class="product-title">${product.name}</h2>
				<p class="product-description">${product.description}</p>
				<div class="product-footer">
					<span class="product-price">KES ${formatPrice(product.price)}</span>
					<form class="cart-line" data-product-id="${product.id}" novalidate>
						<label for="quantity-${product.id}">Quantity</label>
						<input class="quantity-input" id="quantity-${product.id}" name="quantity" type="text" inputmode="numeric" value="1" aria-describedby="quantity-error-${product.id}">
						<p class="field-error" id="quantity-error-${product.id}" aria-live="polite"></p>
						<button class="add-to-cart" type="submit">Add to cart</button>
						<p class="success-message" aria-live="polite">Added to cart.</p>
					</form>
				</div>`;
			grid.append(card);
		});

		noResults.hidden = visibleProducts.length > 0;
		renderGallery();
		updateCartTotal();
	}

	function calculateCartTotal() {
		return [...cartItems.values()].reduce((total, item) => total + item.price * item.quantity, 0);
	}

	function updateCartTotal() {
		cartTotalDisplay.textContent = formatPrice(calculateCartTotal());
	}

	searchInput.addEventListener("input", renderProducts);
	categoryFilter.addEventListener("change", renderProducts);
	previousButton.addEventListener("click", () => {
		if (visibleProducts.length < 2) return;
		slideshowIndex = (slideshowIndex - 1 + visibleProducts.length) % visibleProducts.length;
		renderGallery();
	});
	nextButton.addEventListener("click", () => {
		if (visibleProducts.length < 2) return;
		slideshowIndex = (slideshowIndex + 1) % visibleProducts.length;
		renderGallery();
	});

	grid.addEventListener("input", (event) => {
		if (!event.target.matches(".quantity-input")) return;
		const field = event.target;
		const result = validateQuantity(field.value);
		showFieldError(field, field.closest(".cart-line").querySelector(".field-error"), result.message);
	});
	grid.addEventListener("submit", (event) => {
		const form = event.target.closest(".cart-line");
		if (!form) return;
		event.preventDefault();

		const quantityField = form.elements.quantity;
		const errorElement = form.querySelector(".field-error");
		const result = validateQuantity(quantityField.value);
		showFieldError(quantityField, errorElement, result.message);
		if (!result.valid) return;

		const product = products.find((item) => item.id === form.dataset.productId);
		const currentItem = cartItems.get(product.id);
		const nextQuantity = (currentItem?.quantity ?? 0) + result.value;
		if (!Number.isSafeInteger(product.price * nextQuantity)) {
			showFieldError(quantityField, errorElement, "Quantity is too large to calculate safely");
			return;
		}

		cartItems.set(product.id, { price: product.price, quantity: nextQuantity });
		numberOfCartItems += result.value;
		cartCount.textContent = numberOfCartItems;
		cartButton.setAttribute("aria-label", `Shopping cart, ${numberOfCartItems} items`);
		updateCartTotal();
		playSuccessAnimation(form.querySelector(".success-message"));
	});

	renderProducts();
}

function setupRegistrationForm() {
	const form = document.querySelector("#register-form");
	if (!form) return;

	const fields = ["name", "email", "password", "phone"];
	const successMessage = document.querySelector("#register-success");
	const validators = {
		name(value) {
			return value.trim().length >= 2
				? ""
				: "Name must contain at least 2 characters";
		},
		email(value) {
			return value.includes("@")
				? ""
				: "Email must contain an @ symbol";
		},
		password(value) {
			return value.length >= 8
				? ""
				: "Password must be at least 8 characters";
		},
		phone(value) {
			return /^\d+$/.test(value.trim())
				? ""
				: "Phone number must contain digits only";
		}
	};

	form.addEventListener("submit", (event) => {
		event.preventDefault();
		let formIsValid = true;

		fields.forEach((name) => {
			const field = form.elements[name];
			const errorElement = document.querySelector(`#${name}-error`);
			const message = validators[name](field.value);
			showFieldError(field, errorElement, message);
			if (message) formIsValid = false;
		});

		if (!formIsValid) {
			successMessage.classList.remove("is-visible");
			return;
		}

		form.reset();
		fields.forEach((name) => {
			form.elements[name].setAttribute("aria-invalid", "false");
		});
		playSuccessAnimation(successMessage);
	});
}

document.addEventListener("DOMContentLoaded", () => {
	setupCatalog();
	setupRegistrationForm();
});
