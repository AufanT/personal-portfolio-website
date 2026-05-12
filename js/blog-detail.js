document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const blogId = params.get("id");

  if (!blogId) {
    window.location.href = "blog.html";
    return;
  }

  const titleEl = document.getElementById("blog-title");
  const badgeEl = document.getElementById("blog-badge");
  const dateEl = document.getElementById("blog-date");
  const linksEl = document.getElementById("blog-links");
  const contentEl = document.getElementById("blog-content");
  const headerEl = document.getElementById("blog-header");

  try {
    const { data: blog, error } = await supabaseClient
      .from("blogs")
      .select("*")
      .eq("id", blogId)
      .single();

    if (error) throw error;

    // ===== DEBUG: Lihat raw data dari Supabase =====
    console.log("=== RAW BLOG DATA ===", blog);
    console.log("=== CONTENT FIELD ===", blog.content);
    console.log("=== CONTENT TYPE ===", typeof blog.content);
    console.log("=== IS ARRAY ===", Array.isArray(blog.content));
    // ===============================================

    // Set Metadata
    document.title = `${blog.title} - Aufan Taufiqurrahman`;
    titleEl.innerText = blog.title;
    badgeEl.innerText = blog.subject;
    dateEl.innerText = new Date(blog.created_at).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
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

    // Render Content — handle both JSONB array and JSON string
    contentEl.innerHTML = "";

    if (blog.description) {
      contentEl.innerHTML += `<p class="lead text-light mb-5">${blog.description}</p>`;
    }

    // Parse content defensively
    let steps = blog.content;
    if (typeof steps === "string") {
      try {
        steps = JSON.parse(steps);
      } catch (e) {
        steps = null;
      }
    }

    console.log("Parsed steps:", steps);

    if (steps && Array.isArray(steps) && steps.length > 0) {
      steps.forEach((step, index) => {
        const stepHtml = `
                    <div class="step-card p-3 p-sm-4 p-md-4 mb-2 mb-md-3">
                        <div class="d-flex align-items-start gap-2 gap-md-3">
                            <span class="badge flex-shrink-0" style="background-color: var(--color-accent); color: #000; min-width: 40px; text-align: center;">${index + 1}</span>
                            <div class="flex-grow-1">
                                <h3 class="h5-md text-white mb-2">${step.title || "(Tanpa Judul)"}</h3>
                                <p class="text-secondary mb-0" style="white-space: pre-wrap; line-height: 1.8; font-size: 0.95rem;">${step.text || ""}</p>
                            </div>
                        </div>
                        ${step.image_url ? `<img src="${step.image_url}" class="step-img mt-3 mt-md-3" alt="Langkah ${index + 1}" onerror="this.style.display='none'">` : ""}
                        
                        ${step.subtitles && Array.isArray(step.subtitles) && step.subtitles.length > 0 ? `
                            <div style="border-top: 1px solid rgba(255,255,255,0.1); margin-top: 15px; padding-top: 15px;">
                                ${step.subtitles.map((subtitle, subIdx) => `
                                    <div style="margin-bottom: 15px;">
                                        <h4 class="h6 text-white mb-2" style="color: var(--color-accent);">
                                            <i class="bi bi-dash me-1"></i>${subtitle.title || `Sub Judul ${subIdx + 1}`}
                                        </h4>
                                        ${subtitle.text ? `<p class="text-secondary mb-2" style="white-space: pre-wrap; line-height: 1.8; font-size: 0.95rem;">${subtitle.text}</p>` : ""}
                                        ${subtitle.images && Array.isArray(subtitle.images) && subtitle.images.length > 0 ? `
                                            <div style="margin-top: 10px;">
                                                ${subtitle.images.map(img => `<img src="${img}" class="step-img mt-2" alt="Gambar" style="display: block;" onerror="this.style.display='none'">`).join("")}
                                            </div>
                                        ` : ""}
                                    </div>
                                `).join("")}
                            </div>
                        ` : ""}
                    </div>
                `;
        contentEl.innerHTML += stepHtml;
      });
    } else {
      // Debug: tampilkan raw content di halaman agar mudah dilihat
      contentEl.innerHTML += `
                <div class="alert alert-warning">
                    <strong>Info Debug:</strong> Langkah-langkah belum tersimpan di database.<br>
                    Raw content: <code>${JSON.stringify(blog.content)}</code><br>
                    <small>Silakan edit ulang artikel ini di dashboard admin dan simpan kembali.</small>
                </div>
            `;
    }

    // Re-initialize reveal
    if (window.initReveal) window.initReveal();
  } catch (error) {
    console.error("Error fetching blog detail:", error);
    contentEl.innerHTML = `
            <div class="text-center py-5">
                <h2 class="text-white">Oops!</h2>
                <p class="text-danger">Artikel tidak ditemukan atau terjadi kesalahan koneksi.</p>
                <a href="blog.html" class="btn btn-primary rounded-pill px-4">Kembali ke Blog</a>
            </div>
        `;
  }
});
