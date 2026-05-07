document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const blogId = params.get('id');

    if (!blogId) {
        window.location.href = 'blog.html';
        return;
    }

    const titleEl = document.getElementById('blog-title');
    const badgeEl = document.getElementById('blog-badge');
    const dateEl = document.getElementById('blog-date');
    const linksEl = document.getElementById('blog-links');
    const contentEl = document.getElementById('blog-content');
    const headerEl = document.getElementById('blog-header');

    try {
        const { data: blog, error } = await supabaseClient
            .from('blogs')
            .select('*')
            .eq('id', blogId)
            .single();

        if (error) throw error;

        // Set Metadata
        document.title = `${blog.title} - Aufan Taufiqurrahman`;
        titleEl.innerText = blog.title;
        badgeEl.innerText = blog.subject;
        dateEl.innerText = new Date(blog.created_at).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        if (blog.cover_url) {
            headerEl.style.backgroundImage = `linear-gradient(rgba(1, 15, 28, 0.8), rgba(1, 15, 28, 0.9)), url('${blog.cover_url}')`;
        }

        // Action Links
        if (blog.github_url) {
            linksEl.innerHTML = `
                <a href="${blog.github_url}" target="_blank" class="btn btn-outline-light rounded-pill px-4">
                    <i class="bi bi-github me-2"></i> Repository GitHub
                </a>
            `;
        }

        // Render Content (JSON steps)
        contentEl.innerHTML = '';
        
        if (blog.description) {
            contentEl.innerHTML += `<p class="lead text-light mb-5">${blog.description}</p>`;
        }

        if (blog.content && Array.isArray(blog.content)) {
            blog.content.forEach((step, index) => {
                const stepHtml = `
                    <div class="step-card reveal">
                        <h3 class="h4 text-white mb-3">Langkah ${index + 1}: ${step.title}</h3>
                        <div class="text-secondary">${step.text}</div>
                        ${step.image_url ? `<img src="${step.image_url}" class="step-img mt-3" alt="Langkah ${index + 1}">` : ''}
                    </div>
                `;
                contentEl.innerHTML += stepHtml;
            } );
        } else {
            contentEl.innerHTML += `<p class="text-secondary">Konten artikel tidak tersedia.</p>`;
        }

        // Re-initialize reveal
        if (window.initReveal) window.initReveal();

    } catch (error) {
        console.error('Error fetching blog detail:', error);
        contentEl.innerHTML = `
            <div class="text-center py-5">
                <h2 class="text-white">Oops!</h2>
                <p class="text-danger">Artikel tidak ditemukan atau terjadi kesalahan koneksi.</p>
                <a href="blog.html" class="btn btn-primary rounded-pill px-4">Kembali ke Blog</a>
            </div>
        `;
    }
});
