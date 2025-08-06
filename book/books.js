document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'I') e.preventDefault();
});

document.addEventListener('DOMContentLoaded', () => {
  const categoryItems = document.querySelectorAll('.categories li');
  const bookCards = document.querySelectorAll('.book-card');
  const searchInput = document.querySelector('#searchInput');

  // Category filter
  categoryItems.forEach(category => {
    category.addEventListener('click', () => {
      const selectedCategory = category.textContent.trim();
      categoryItems.forEach(c => c.classList.remove('selected'));
      category.classList.add('selected');

      bookCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (selectedCategory === 'All Books' || cardCategory.includes(selectedCategory)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });

      // Reset search
      searchInput.value = '';
    });
  });

  // Search filter
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase().trim();
    bookCards.forEach(card => {
      const title = card.querySelector('h4').textContent.toLowerCase();
      const author = card.querySelector('p').textContent.toLowerCase();
      if (title.includes(query) || author.includes(query)) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

