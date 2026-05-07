document.addEventListener('DOMContentLoaded', async () => {
    const blogContainer = document.getElementById('blog-container');
    const loadingSpinner = document.getElementById('blog-loading');

    try {
        // Fetch published blogs from Supabase
        const { data, error } = await supabaseClient
            .from('blogs')
            .select('*')
            .eq('is_published', true)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Clear loading spinner
        blogContainer.innerHTML = '';

        if (data.length === 0) {
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
                <div class="col-md-4 reveal">
                    <div class="card blog-card">
                        <div class="blog-img-wrapper">
                            <img src="${blog.cover_url || 'images/onprogress.png'}" alt="${blog.title}">
                        </div>
                        <div class="card-body p-4">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="badge rounded-pill badge-neon">${blog.subject}</span>
                                <small class="text-secondary">${date}</small>
                            </div>
                            <h5 class="card-title text-white fw-bold">${blog.title}</h5>
                            <p class="card-text text-secondary small">${blog.description || ''}</p>
                            <a href="blog-detail.html?id=${blog.id}" class="btn btn-sm btn-outline-success rounded-pill mt-3">Baca Selengkapnya</a>
                        </div>
                    </div>
                </div>
            `;
            blogContainer.innerHTML += blogCard;
        });

        // Re-initialize reveal animations if they exist in script.js
        if (window.initReveal) window.initReveal();

    } catch (error) {
        console.error('Error fetching blogs:', error);
        blogContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-danger">Gagal memuat data blog. Pastikan konfigurasi Supabase sudah benar.</p>
            </div>
        `;
    }
});
