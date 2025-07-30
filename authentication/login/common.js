document.addEventListener('DOMContentLoaded', function() {
  const profileDropdown = document.querySelector('.profile-dropdown');
  const profileIcon = document.querySelector('.profile-icon');
  
  profileIcon.addEventListener('click', function(e) {
    e.stopPropagation();
    profileDropdown.classList.toggle('active');
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', function() {
    profileDropdown.classList.remove('active');
  });
});

// ==================== Sidebar Start ======================
const overlay = document.getElementById("overlay");
function openNav() {
  document.getElementById("sidebar").style.width = "300px";
  overlay.classList.add("active");
}

function closeNav() {
  document.getElementById("sidebar").style.width = "0";
  overlay.classList.remove("active");
}

window.addEventListener('click', function (event) {
  const sidebar = document.getElementById('sidebar');
  const menuBtn = document.querySelector('.mobile-menu-btn');

  if (!sidebar.contains(event.target) && event.target !== menuBtn && !menuBtn.contains(event.target)) {
    closeNav();
  }
});
// ============== Sidebar End  ==================


// ===========Mobile Search Icon Toggle============

const searchIcon = document.getElementById('search-icon');
const searchInput = document.querySelector('.mobile-search-input');

searchIcon.addEventListener('click', function (event) {
  event.stopPropagation(); 
  searchInput.classList.toggle('active');

  if (searchInput.classList.contains('active')) {
    searchInput.focus();
  }
});

document.addEventListener('click', function (event) {
  if (
    !searchInput.contains(event.target) &&
    !searchIcon.contains(event.target)
  ) {
    searchInput.classList.remove('active');
  }
});

// ==============Cart Functionality===========
let cart = [];
const cartIcon = document.getElementById('cart-icon');
const mobileCartIcon = document.getElementById('mobile-cart-icon');
const cartCount = document.getElementById('cart-count');
const mobileCartCount = document.getElementById('mobile-cart-count');
const cartSidebar = document.getElementById('cart-sidebar');
const closeCart = document.getElementById('close-cart');
const cartOverlay = document.getElementById('cartOverlay');
const cartContent = document.getElementById("item-container");
const cartTotal = document.getElementById("cart-total");


cartIcon.addEventListener('click', () => {
  cartSidebar.classList.add('open');
  cartOverlay.classList.add('active');
});
mobileCartIcon.addEventListener('click', () => {
  cartSidebar.classList.add('open');
  cartOverlay.classList.add('active');
});

closeCart.addEventListener('click', () => {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('active');
});

cartOverlay.addEventListener('click', () => {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('active');
});

function addToCart(button) {
  const card = button.closest('.book-card');
  const img = card.querySelector('img').src;
  const title = card.querySelector('h3').textContent;
  const author = card.querySelector('p').textContent;


  cart.push({
    name: title,
    img: img,
    author: author,
    quantity: 1
  });
  updateCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCart();
}

function updateCart() {
  const totalItems = cart.length;
  cartCount.textContent = totalItems;
  if (mobileCartCount) mobileCartCount.textContent = totalItems;

  const emptyCart = document.querySelector(".empty-cart");

  if (cart.length === 0) {
    emptyCart.style.display = "block";
    cartContent.innerHTML = '';
    cartTotal.textContent = "0";
    localStorage.removeItem('cart')
    return;
  } else {
    emptyCart.style.display = "none";
  }

  let itemHTML = '';
  cart.forEach((item, index) => {
    itemHTML += `<div class="image-and-details">
                                <div class="image"><img src="${item.img}" alt="${item.name}" srcset=""></div>
                                      <div class="details">
                                            <h4 class="book-title">${item.name}</h4>
                                            <p class="book-author">${item.author}</p>
                                        </div>
                                  </div>
                              <div class="remove" onclick="removeFromCart(${index})">Remove</div>`;
  });

  cartContent.innerHTML = itemHTML;
  cartTotal.textContent = cart.length;

  localStorage.setItem('cart', JSON.stringify(cart));
}


function loadcart() {
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCart();
  }
}

loadcart();