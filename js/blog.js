document.addEventListener('DOMContentLoaded', async () => {
    const blogContainer = document.getElementById('blog-container');

    try {
        console.log('Fetching blogs...');
        const { data, error } = await supabaseClient
            .from('blogs')
            .select('*')
            .eq('is_published', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase Error:', error);
            throw error;
        }

        console.log('Data received:', data);

        blogContainer.innerHTML = '';

        if (!data || data.length === 0) {
            blogContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <p class="text-secondary">Belum ada artikel yang dipublikasikan.</p>
                </div>
            `;
            return;
        }

        data.forEach(blog => {
            const date = new Date(blog.created_at).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            const blogCard = `
                <div class="col-md-4">
                    <div class="card blog-card h-100 shadow-sm" data-blog-id="${blog.id}" style="cursor: pointer;">
                        <div class="blog-img-wrapper">
                            <img src="${blog.cover_url || 'images/onprogress.png'}" alt="${blog.title}" onerror="this.src='images/onprogress.png'">
                        </div>
                        <div class="card-body p-4">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="badge rounded-pill bg-success" style="background-color: var(--color-accent) !important;">${blog.subject || 'Praktikum'}</span>
                                <small class="text-secondary">${date}</small>
                            </div>
                            <h5 class="card-title text-white fw-bold">${blog.title}</h5>
                            <p class="card-text text-secondary small blog-card-description">${blog.description || ''}</p>
                            <a href="blog-detail.html?id=${blog.id}" class="btn btn-sm btn-outline-success rounded-pill">Baca Selengkapnya</a>
                        </div>
                    </div>
                </div>
            `;
            blogContainer.innerHTML += blogCard;
        });

        // Event delegation on container
        blogContainer.addEventListener('click', function(e) {
            const card = e.target.closest('.blog-card');
            if (!card) return;
            
            // Don't navigate if clicking the button
            if (e.target.closest('.btn')) return;
            
            const blogId = card.dataset.blogId;
            if (blogId) {
                window.location.href = `blog-detail.html?id=${blogId}`;
            }
        });

    } catch (error) {
        console.error('Final Catch Error:', error);
        blogContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-danger">Gagal memuat data. Error: ${error.message || 'Unknown error'}</p>
            </div>
        `;
    }
});
