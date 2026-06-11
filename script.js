/* ALWAYS PET — Interactive Layer */

(function () {
  "use strict";

  /* ── Neural Paw Particle Canvas ── */
  const canvas = document.getElementById("neural-paws");
  const ctx = canvas.getContext("2d");
  let nodes = [];
  let mouse = { x: -1000, y: -1000 };
  const COLORS = ["#ff6b4a", "#9b7dff", "#6aab82", "#ffb347"];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initNodes();
  }

  function initNodes() {
    const count = Math.min(55, Math.floor((canvas.width * canvas.height) / 18000));
    nodes = [];
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2.5 + 1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }
  }

  function drawPaw(x, y, size, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    const s = size;
    ctx.beginPath();
    ctx.ellipse(x - s * 0.35, y - s * 0.3, s * 0.22, s * 0.28, 0, 0, Math.PI * 2);
    ctx.ellipse(x + s * 0.35, y - s * 0.3, s * 0.22, s * 0.28, 0, 0, Math.PI * 2);
    ctx.ellipse(x - s * 0.55, y + s * 0.05, s * 0.17, s * 0.22, 0, 0, Math.PI * 2);
    ctx.ellipse(x + s * 0.55, y + s * 0.05, s * 0.17, s * 0.22, 0, 0, Math.PI * 2);
    ctx.ellipse(x, y + s * 0.35, s * 0.3, s * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function animateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    nodes.forEach((n) => {
      const dx = mouse.x - n.x;
      const dy = mouse.y - n.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 160) {
        n.vx -= (dx / dist) * 0.02;
        n.vy -= (dy / dist) * 0.02;
      }
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
      if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      n.vx *= 0.995;
      n.vy *= 0.995;
    });

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(155, 125, 255, ${0.12 * (1 - dist / 130)})`;
          ctx.lineWidth = 0.8;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    nodes.forEach((n, i) => {
      if (i % 7 === 0) {
        drawPaw(n.x, n.y, n.r * 4, n.color, 0.35);
      } else {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.globalAlpha = 0.5;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    });

    requestAnimationFrame(animateCanvas);
  }

  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  resizeCanvas();
  animateCanvas();

  /* ── Header scroll ── */
  const header = document.getElementById("siteHeader");
  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 40);
  });

  /* ── Mobile nav ── */
  const menuToggle = document.getElementById("menuToggle");
  const siteNav = document.getElementById("siteNav");
  menuToggle.addEventListener("click", () => {
    const open = siteNav.classList.toggle("open");
    menuToggle.classList.toggle("active", open);
    menuToggle.setAttribute("aria-expanded", open);
  });
  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("open");
      menuToggle.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ── Scroll reveal ── */
  const revealEls = document.querySelectorAll(".reveal, .engine-card");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          const delay = entry.target.style.getPropertyValue("--i");
          if (delay) {
            entry.target.style.transitionDelay = `${parseInt(delay, 10) * 0.1}s`;
          }
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  /* ── Counter animation ── */
  const counters = document.querySelectorAll("[data-count]");
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        let current = 0;
        const step = Math.ceil(target / 40);
        const tick = () => {
          current = Math.min(current + step, target);
          el.textContent = current;
          if (current < target) requestAnimationFrame(tick);
        };
        tick();
        counterObserver.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((c) => counterObserver.observe(c));

  /* ── AI Concierge ── */
  const chatMessages = document.getElementById("chatMessages");
  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatInput");
  const promptChips = document.getElementById("promptChips");
  const fabAi = document.getElementById("fabAi");

  const responses = {
    default:
      "Thank you for reaching out! Our team specializes in AI-powered trading and commerce — from intelligent procurement to cross-border trade. For detailed inquiries, please email us at miranda12bertha1@gmail.com.",
    different:
      "What sets Always Pet apart is our intelligence-first AI approach. We don't just move goods — our neural systems analyze market signals, predict demand, and deliver trade decisions that maximize value for every partner. Technology built for commerce.",
    curate:
      "Our Smart Procurement Engine uses machine learning to evaluate supplier quality, cost efficiency, and delivery reliability. Every sourcing decision passes through AI scoring pipelines — ensuring optimal procurement outcomes for our partners and clients.",
    crossborder:
      "Yes! We provide full cross-border trade infrastructure — including compliance coordination, logistics management, and market entry support. Our AI demand forecasting helps international partners identify the right timing and channels for expansion into new markets.",
    partner:
      "We welcome partnerships with suppliers, distributors, and trade organizations. Whether you're looking for AI-enhanced distribution, supply chain integration, or wholesale trading — reach out to miranda12bertha1@gmail.com and our team will respond promptly.",
    services:
      "Our core services include general merchandise trading, AI-enhanced commerce operations, cross-border trade solutions, and supply chain distribution. Each service is powered by our four-module AI engine: Market Signal AI, Smart Procurement, Demand Forecasting, and Trade Concierge.",
    company:
      "Chengdu Yizhi Chongni Trading Co., Ltd. (Always Pet) is registered in Wuhou District, Chengdu, Sichuan, China. USCC: 91510107MAC34W2DXL. We operate at the intersection of artificial intelligence and modern trading commerce.",
    hello:
      "Hello! Welcome to Always Pet. I'm here to help you learn about our AI-powered trading and commerce platform. Feel free to ask about our services, technology, partnerships, or company information.",
    email:
      "You can reach our team directly at miranda12bertha1@gmail.com. We typically respond within one business day. Looking forward to connecting!",
  };

  function matchResponse(text) {
    const t = text.toLowerCase();
    if (/hello|hi|hey|greetings/.test(t)) return responses.hello;
    if (/different|unique|special|stand out/.test(t)) return responses.different;
    if (/curat|procure|sourc|product|catalog|inventory|quality/.test(t)) return responses.curate;
    if (/cross.?border|global|international|export|import/.test(t)) return responses.crossborder;
    if (/partner|collaborat|work together|cooperat/.test(t)) return responses.partner;
    if (/service|offer|do you do|capabilit/.test(t)) return responses.services;
    if (/company|about|who are|address|uscc|location/.test(t)) return responses.company;
    if (/email|contact|reach|mail/.test(t)) return responses.email;
    return responses.default;
  }

  function addMessage(text, type) {
    const div = document.createElement("div");
    div.className = `msg msg-${type}`;
    div.innerHTML = `<p>${text}</p>`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return div;
  }

  function showTyping() {
    const div = document.createElement("div");
    div.className = "msg-typing";
    div.innerHTML = "<span></span><span></span><span></span>";
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return div;
  }

  function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    addMessage(trimmed, "user");
    chatInput.value = "";
    const typing = showTyping();
    const delay = 800 + Math.random() * 700;
    setTimeout(() => {
      typing.remove();
      addMessage(matchResponse(trimmed), "ai");
    }, delay);
  }

  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    sendMessage(chatInput.value);
  });

  promptChips.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      sendMessage(btn.dataset.prompt);
    });
  });

  fabAi.addEventListener("click", () => {
    document.getElementById("concierge").scrollIntoView({ behavior: "smooth" });
    setTimeout(() => chatInput.focus(), 600);
  });
})();
