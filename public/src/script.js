// script.js

document.addEventListener('DOMContentLoaded', () => {
    const postsListElement = document.getElementById('posts-list');
    const paginationElement = document.getElementById('pagination');
    const sortByElement = document.getElementById('sort-by');
    const showPerPageElement = document.getElementById('show-per-page');
    const header = document.getElementById('header');

    let currentPage = localStorage.getItem('currentPage') || 1;
    let itemsPerPage = localStorage.getItem('itemsPerPage') || 10;
    let currentSort = localStorage.getItem('currentSort') || '-published_at';

    function loadPosts() {
        axios({
            method: 'get',
            url: '/api/ideas',
            headers: {
                'Content-Type': 'application/json',
            },
            params: {
                'page[number]': currentPage,
                'page[size]': itemsPerPage,
                append: ['small_image', 'medium_image'],
                sort: currentSort,
            }
        })
        .then(response => {
            const posts = response.data.data;
            renderPosts(posts);
            setupPagination(response.data.meta.pagination);
        })
        .catch(error => {
            console.error('Error fetching posts:', error);
        });
    }

    function renderPosts(posts) {
        postsListElement.innerHTML = '';
        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post-card';

            postElement.innerHTML = `
                <img data-src="${post.small_image}" alt="${post.title}" class="lazyload" />
                <h2 class="post-title">${truncateText(post.title, 3)}</h2>
                <p>${post.description}</p>
            `;
            postsListElement.appendChild(postElement);
        });

        const lazyLoadInstance = new LazyLoad({
            elements_selector: ".lazyload"
        });
    }

    function truncateText(text, lines) {
        const lineHeight = 1.2;
        const maxHeight = lineHeight * lines;
        const ellipsis = '...';

        const tempElement = document.createElement('div');
        tempElement.style.maxHeight = `${maxHeight}em`;
        tempElement.style.overflow = 'hidden';
        tempElement.style.display = '-webkit-box';
        tempElement.style.webkitBoxOrient = 'vertical';
        tempElement.style.webkitLineClamp = lines;
        tempElement.style.position = 'absolute';
        tempElement.style.visibility = 'hidden';
        tempElement.innerHTML = text;

        document.body.appendChild(tempElement);
        const isTruncated = tempElement.scrollHeight > tempElement.clientHeight;
        document.body.removeChild(tempElement);

        return isTruncated ? text.slice(0, -ellipsis.length) + ellipsis : text;
    }

    function setupPagination(pagination) {
        paginationElement.innerHTML = '';

        for (let i = 1; i <= pagination.total_pages; i++) {
            const pageButton = document.createElement('button');
            pageButton.innerText = i;
            pageButton.onclick = () => {
                currentPage = i;
                saveState();
                loadPosts();
            };
            paginationElement.appendChild(pageButton);
        }
    }

    function saveState() {
        localStorage.setItem('currentPage', currentPage);
        localStorage.setItem('itemsPerPage', itemsPerPage);
        localStorage.setItem('currentSort', currentSort);
    }

    // Memuat post pertama kali
    loadPosts();

    sortByElement.addEventListener('change', function() {
        currentSort = this.value === 'newest' ? '-published_at' : 'published_at';
        saveState();
        loadPosts();
    });

    showPerPageElement.addEventListener('change', function() {
        itemsPerPage = this.value;
        saveState();
        loadPosts();
    });

    // Menangani scroll behavior pada header
    let lastScrollTop = 0;

    window.addEventListener('scroll', function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > lastScrollTop) {
            header.classList.add('hidden');
        } else {
            header.classList.remove('hidden');
            if (scrollTop > 0) {
                header.classList.add('transparent');
            } else {
                header.classList.remove('transparent');
            }
        }
        lastScrollTop = scrollTop;
    });
});
