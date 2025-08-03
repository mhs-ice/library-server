

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
                <h3>By ${book.author}</h3>
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