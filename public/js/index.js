// document.addEventListener('contextmenu', (e) => e.preventDefault());
// document.addEventListener('keydown', (e) => {
//   if (e.ctrlKey && e.shiftKey && e.key === 'I') e.preventDefault();
// });

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

// ================= Slider ===================

var slideIndex = 1;
showDivs(slideIndex);
autoSlide();

function plusDivs(n) {
  showDivs(slideIndex += n);
}

function currentDiv(n) {
  showDivs(slideIndex = n);
}

function showDivs(n) {
  var i;
  var x = document.getElementsByClassName("mySlides");
  var dots = document.getElementsByClassName("demo");
  if (n > x.length) 
    { slideIndex = 1 }
  if (n < 1) 
    { slideIndex = x.length }
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" w3-white", "");
  }
  x[slideIndex - 1].style.display = "block";
  dots[slideIndex - 1].className += " w3-white";
}
function autoSlide() {
  slideIndex++;
  showDivs(slideIndex);
  setTimeout(autoSlide, 3000);
}

// ============ Slider End =================

// ============Stats Start============

const counters = document.querySelectorAll('.number');
let started = false;

function animateCounter(counter) {
  const target = +counter.getAttribute('data-target');
  const speed = 200;
  const update = () => {
    const current = +counter.innerText;
    const increment = Math.ceil(target / speed);
    if (current < target) {
      counter.innerText = current + increment;
      setTimeout(update, 10);
    } else {
      counter.innerText = target + '+';
    }
  };
  update();
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !started) {
      counters.forEach(counter => animateCounter(counter));
      started = true;
    }
  });
}, { threshold: 0.5 });

observer.observe(document.getElementById('stats'));
// ============Stats End===============

// ============ Testimonial Start===========
const carousel = document.getElementById('carousel');
const dots = document.querySelectorAll('.dot');
const container = document.getElementById('carouselContainer');
let index = 0;
let startX = 0;
let isDragging = false;

function updateCarousel() {
  carousel.style.transform = `translateX(-${index * 100}%)`;
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

function goToSlide(i) {
  index = i;
  updateCarousel();
}

function nextSlide() {
  index = (index + 1) % dots.length;
  updateCarousel();
}

setInterval(nextSlide, 4000);

container.addEventListener('touchstart', (e) => {
  startX = e.touches[0].clientX;
  isDragging = true;
});

container.addEventListener('touchmove', (e) => {
  if (!isDragging) return;
  const diff = e.touches[0].clientX - startX;
  if (Math.abs(diff) > 50) {
    isDragging = false;
    if (diff > 0) {
      index = (index - 1 + dots.length) % dots.length;
    } else {
      index = (index + 1) % dots.length;
    }
    updateCarousel();
  }
});

container.addEventListener('touchend', () => {
  isDragging = false;
});
// =================Testimonial End=============



//  ============ Show More Notices============

function toggleNotice(element) {
  element.classList.toggle('active');
}


function showMoreNotices() {
  const hiddenNoticesContainer = document.querySelector('.hidden-notices');
  const noticeList = document.querySelector('.notice-list');
  const showMoreBtn = document.querySelector('.notice-show-more');


  if (showMoreBtn.textContent === 'Show More') {
    const notices = Array.from(hiddenNoticesContainer.children);
    notices.sort((a, b) => {
      const dateA = new Date(a.querySelector('.notice-date').textContent);
      const dateB = new Date(b.querySelector('.notice-date').textContent);
      return dateB - dateA;
    });

    notices.forEach(notice => {
      noticeList.appendChild(notice);
      notice.classList.remove('hidden-notice');
    });

    showMoreBtn.textContent = 'Show Less';
  }

  else {
    const allNotices = document.querySelectorAll('.notice-item');
    const initialNoticesCount = 2;


    allNotices.forEach((notice, index) => {
      if (index >= initialNoticesCount) {
        notice.classList.add('hidden-notice');
        hiddenNoticesContainer.appendChild(notice);
      }
    });

    showMoreBtn.textContent = 'Show More';
  }
}


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


// cartIcon.addEventListener('click', () => {
//   cartSidebar.classList.add('open');
//   cartOverlay.classList.add('active');
// });
// mobileCartIcon.addEventListener('click', () => {
//   cartSidebar.classList.add('open');
//   cartOverlay.classList.add('active');
// });

// closeCart.addEventListener('click', () => {
//   cartSidebar.classList.remove('open');
//   cartOverlay.classList.remove('active');
// });

// cartOverlay.addEventListener('click', () => {
//   cartSidebar.classList.remove('open');
//   cartOverlay.classList.remove('active');
// });

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




async function loadFeaturedBooks() {
    try{
        const response = await fetch('/featured-books');
        const books = await response.json()

        const container= document.getElementById('bookGrid')
        container.innerHTML='';

        books.forEach(book =>{
            bookCard=document.createElement('div');
            bookCard.className='book-card';
            bookCard.innerHTML=`
                <img src="${book.image_url}"/>
                <h3>${book.title}</h3>
                <p>By ${book.author}</p>
                <p>Copies available: ${book.copies_available}</p>
                <div class="btns">
                    <a href="assets/download/ai.pdf" class="btn" download>
                        <button class="download-btn">Download</button>
                    </a>
                    <button onclick="addToCart(this)">Borrow</Button>
                </div>
            `;
            container.appendChild(bookCard)
        });
    }catch(error){
        console.log("Error:", error)
        document.getElementById("bookGrid").innerHTML=`
            <p class="error-message">Failed to load books. Please try again later.</p>
        `;
    }
    
}

document.addEventListener('DOMContentLoaded', loadFeaturedBooks);


// ===============================login/signup start=========================

document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
});

// Check if user is logged in
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        
        if (data.authenticated) {
            showUserProfile(data.user);
        } else {
            showGuestButtons();
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        showGuestButtons();
    }
}

// Show profile icon and hide login/signup buttons
function showUserProfile(user) {
    document.getElementById('login-btn').style.display = 'none';
    document.getElementById('profile-dropdown').style.display = 'block';
}

// Show login/signup buttons and hide profile
function showGuestButtons() {
    document.getElementById('login-btn').style.display = 'flex';
    document.getElementById('profile-dropdown').style.display = 'none';
}


// Logout function
async function logout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            // Redirect to home or login page
            window.location.href = '/login';
        } else {
            alert('Logout failed. Please try again.');
        }
    } catch (error) {
        console.error('Logout error:', error);
        alert('An error occurred during logout.');
    }
}
