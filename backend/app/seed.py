from datetime import datetime

from .extensions import db
from .models import Page, PageSection, SectionFieldValue, Template, TemplateField, User


TEMPLATES = [
    {
        "name": "Hero Section",
        "slug": "hero",
        "description": "A bold opening section with headline, subtitle, and immersive image.",
        "fields": [
            ("Title", "title", "text"),
            ("Subtitle", "subtitle", "text"),
            ("Background Image", "background_image", "image"),
        ],
    },
    {
        "name": "About Section",
        "slug": "about",
        "description": "A split layout for brand story, positioning, and supporting image.",
        "fields": [
            ("Heading", "heading", "text"),
            ("Description", "description", "text"),
            ("Image", "image", "image"),
        ],
    },
    {
        "name": "Services Section",
        "slug": "services",
        "description": "A three-column service grid for offers and capabilities.",
        "fields": [
            ("Service 1 Name", "service_1_name", "text"),
            ("Service 1 Icon", "service_1_icon", "image"),
            ("Service 2 Name", "service_2_name", "text"),
            ("Service 2 Icon", "service_2_icon", "image"),
            ("Service 3 Name", "service_3_name", "text"),
            ("Service 3 Icon", "service_3_icon", "image"),
        ],
    },
    {
        "name": "Contact Section",
        "slug": "contact",
        "description": "A conversion section with contact channels and location imagery.",
        "fields": [
            ("Title", "title", "text"),
            ("Email", "email", "text"),
            ("Phone", "phone", "text"),
            ("Map Image", "map_image", "image"),
        ],
    },
    {
        "name": "Footer Section",
        "slug": "footer",
        "description": "A compact footer with logo, copyright text, and social links.",
        "fields": [
            ("Copyright Text", "copyright_text", "text"),
            ("Logo URL", "logo_url", "image"),
            ("Instagram Link", "instagram_link", "text"),
            ("Facebook Link", "facebook_link", "text"),
        ],
    },
    # 22 new website building section templates
    {
        "name": "Navbar Section",
        "slug": "navbar",
        "description": "A clean navigation bar with logo, page links, and a call-to-action button.",
        "fields": [
            ("Logo URL", "logo_url", "image"),
            ("Logo Text", "logo_text", "text"),
            ("Link 1 Text", "link_1_text", "text"),
            ("Link 1 URL", "link_1_url", "text"),
            ("Link 2 Text", "link_2_text", "text"),
            ("Link 2 URL", "link_2_url", "text"),
            ("Link 3 Text", "link_3_text", "text"),
            ("Link 3 URL", "link_3_url", "text"),
            ("CTA Text", "cta_text", "text"),
            ("CTA Link", "cta_link", "text"),
        ],
    },
    {
        "name": "Hero Section (Variant)",
        "slug": "hero_variant",
        "description": "A premium hero variant featuring split text, a prominent call-to-action, a secondary action, and a large mockup/preview image.",
        "fields": [
            ("Badge", "badge", "text"),
            ("Title", "title", "text"),
            ("Subtitle", "subtitle", "text"),
            ("Primary Button Text", "primary_btn_text", "text"),
            ("Primary Button Link", "primary_btn_link", "text"),
            ("Secondary Button Text", "secondary_btn_text", "text"),
            ("Secondary Button Link", "secondary_btn_link", "text"),
            ("Preview Image", "preview_image", "image"),
        ],
    },
    {
        "name": "Feature Grid",
        "slug": "feature_grid",
        "description": "A high-fidelity grid displaying your main product values with icons, titles, and descriptions.",
        "fields": [
            ("Heading", "heading", "text"),
            ("Subheading", "subheading", "text"),
            ("Feature 1 Icon", "feat_1_icon", "image"),
            ("Feature 1 Title", "feat_1_title", "text"),
            ("Feature 1 Description", "feat_1_desc", "text"),
            ("Feature 2 Icon", "feat_2_icon", "image"),
            ("Feature 2 Title", "feat_2_title", "text"),
            ("Feature 2 Description", "feat_2_desc", "text"),
            ("Feature 3 Icon", "feat_3_icon", "image"),
            ("Feature 3 Title", "feat_3_title", "text"),
            ("Feature 3 Description", "feat_3_desc", "text"),
            ("Feature 4 Icon", "feat_4_icon", "image"),
            ("Feature 4 Title", "feat_4_title", "text"),
            ("Feature 4 Description", "feat_4_desc", "text"),
        ],
    },
    {
        "name": "Stats Section",
        "slug": "stats",
        "description": "A premium numeric facts showcase displaying milestones, size, or credibility numbers.",
        "fields": [
            ("Title", "title", "text"),
            ("Subtitle", "subtitle", "text"),
            ("Stat 1 Value", "stat_1_val", "text"),
            ("Stat 1 Label", "stat_1_label", "text"),
            ("Stat 2 Value", "stat_2_val", "text"),
            ("Stat 2 Label", "stat_2_label", "text"),
            ("Stat 3 Value", "stat_3_val", "text"),
            ("Stat 3 Label", "stat_3_label", "text"),
            ("Stat 4 Value", "stat_4_val", "text"),
            ("Stat 4 Label", "stat_4_label", "text"),
        ],
    },
    {
        "name": "Logo Cloud",
        "slug": "logo_cloud",
        "description": "A row of trust-building partner or customer logos with clean, responsive spacing.",
        "fields": [
            ("Title", "title", "text"),
            ("Logo 1", "logo_1", "image"),
            ("Logo 2", "logo_2", "image"),
            ("Logo 3", "logo_3", "image"),
            ("Logo 4", "logo_4", "image"),
            ("Logo 5", "logo_5", "image"),
            ("Logo 6", "logo_6", "image"),
        ],
    },
    {
        "name": "Testimonials Section",
        "slug": "testimonials",
        "description": "A premium layout to highlight success stories, reviews, and client quotes.",
        "fields": [
            ("Heading", "heading", "text"),
            ("Subheading", "subheading", "text"),
            ("Quote 1", "quote_1", "text"),
            ("Author 1 Name", "author_1_name", "text"),
            ("Author 1 Role", "author_1_role", "text"),
            ("Author 1 Avatar", "author_1_avatar", "image"),
            ("Quote 2", "quote_2", "text"),
            ("Author 2 Name", "author_2_name", "text"),
            ("Author 2 Role", "author_2_role", "text"),
            ("Author 2 Avatar", "author_2_avatar", "image"),
        ],
    },
    {
        "name": "Pricing Grid",
        "slug": "pricing",
        "description": "A clear multi-tiered pricing comparison grid with call-to-actions.",
        "fields": [
            ("Title", "title", "text"),
            ("Subtitle", "subtitle", "text"),
            ("Plan 1 Name", "plan_1_name", "text"),
            ("Plan 1 Price", "plan_1_price", "text"),
            ("Plan 1 Features", "plan_1_features", "text"),
            ("Plan 1 CTA", "plan_1_cta", "text"),
            ("Plan 2 Name", "plan_2_name", "text"),
            ("Plan 2 Price", "plan_2_price", "text"),
            ("Plan 2 Features", "plan_2_features", "text"),
            ("Plan 2 CTA", "plan_2_cta", "text"),
            ("Plan 2 Popular Badge", "plan_2_badge", "text"),
        ],
    },
    {
        "name": "FAQ Section",
        "slug": "faq",
        "description": "Frequently Asked Questions block featuring smooth expandable items.",
        "fields": [
            ("Heading", "heading", "text"),
            ("Subheading", "subheading", "text"),
            ("Q1 Question", "q1_question", "text"),
            ("Q1 Answer", "q1_answer", "text"),
            ("Q2 Question", "q2_question", "text"),
            ("Q2 Answer", "q2_answer", "text"),
            ("Q3 Question", "q3_question", "text"),
            ("Q3 Answer", "q3_answer", "text"),
            ("Q4 Question", "q4_question", "text"),
            ("Q4 Answer", "q4_answer", "text"),
        ],
    },
    {
        "name": "Call To Action (CTA)",
        "slug": "cta",
        "description": "A high-conversion block encouraging the visitor to sign up, buy, or get in touch.",
        "fields": [
            ("Heading", "heading", "text"),
            ("Description", "description", "text"),
            ("Primary Button Text", "primary_btn_text", "text"),
            ("Primary Button Link", "primary_btn_link", "text"),
            ("Secondary Button Text", "secondary_btn_text", "text"),
            ("Secondary Button Link", "secondary_btn_link", "text"),
        ],
    },
    {
        "name": "Newsletter Subscription",
        "slug": "newsletter",
        "description": "A beautifully styled form block to gather emails and drive audience engagement.",
        "fields": [
            ("Title", "title", "text"),
            ("Description", "description", "text"),
            ("Input Placeholder", "input_placeholder", "text"),
            ("Button Text", "button_text", "text"),
            ("Privacy Notice", "privacy_notice", "text"),
        ],
    },
    {
        "name": "Portfolio Grid",
        "slug": "portfolio",
        "description": "A curated list of your creative works, projects, or client success stories.",
        "fields": [
            ("Title", "title", "text"),
            ("Subtitle", "subtitle", "text"),
            ("Project 1 Image", "proj_1_img", "image"),
            ("Project 1 Title", "proj_1_title", "text"),
            ("Project 1 Category", "proj_1_cat", "text"),
            ("Project 2 Image", "proj_2_img", "image"),
            ("Project 2 Title", "proj_2_title", "text"),
            ("Project 2 Category", "proj_2_cat", "text"),
            ("Project 3 Image", "proj_3_img", "image"),
            ("Project 3 Title", "proj_3_title", "text"),
            ("Project 3 Category", "proj_3_cat", "text"),
        ],
    },
    {
        "name": "Photo Gallery",
        "slug": "gallery",
        "description": "An immersive, multi-ratio grid of brand assets, photos, or office culture.",
        "fields": [
            ("Heading", "heading", "text"),
            ("Subheading", "subheading", "text"),
            ("Image 1", "image_1", "image"),
            ("Image 2", "image_2", "image"),
            ("Image 3", "image_3", "image"),
            ("Image 4", "image_4", "image"),
        ],
    },
    {
        "name": "Team Showcase",
        "slug": "team",
        "description": "Show the brilliant faces and roles behind your product or agency.",
        "fields": [
            ("Title", "title", "text"),
            ("Subtitle", "subtitle", "text"),
            ("Member 1 Name", "member_1_name", "text"),
            ("Member 1 Role", "member_1_role", "text"),
            ("Member 1 Image", "member_1_img", "image"),
            ("Member 2 Name", "member_2_name", "text"),
            ("Member 2 Role", "member_2_role", "text"),
            ("Member 2 Image", "member_2_img", "image"),
            ("Member 3 Name", "member_3_name", "text"),
            ("Member 3 Role", "member_3_role", "text"),
            ("Member 3 Image", "member_3_img", "image"),
        ],
    },
    {
        "name": "Company Timeline",
        "slug": "timeline",
        "description": "Showcase key company milestones, historical achievements, or roadmap items.",
        "fields": [
            ("Title", "title", "text"),
            ("Milestone 1 Year", "mile_1_year", "text"),
            ("Milestone 1 Title", "mile_1_title", "text"),
            ("Milestone 1 Desc", "mile_1_desc", "text"),
            ("Milestone 2 Year", "mile_2_year", "text"),
            ("Milestone 2 Title", "mile_2_title", "text"),
            ("Milestone 2 Desc", "mile_2_desc", "text"),
            ("Milestone 3 Year", "mile_3_year", "text"),
            ("Milestone 3 Title", "mile_3_title", "text"),
            ("Milestone 3 Desc", "mile_3_desc", "text"),
        ],
    },
    {
        "name": "Process Steps",
        "slug": "process_steps",
        "description": "A structured step-by-step description of how your service or product works.",
        "fields": [
            ("Title", "title", "text"),
            ("Step 1 Number", "step_1_num", "text"),
            ("Step 1 Title", "step_1_title", "text"),
            ("Step 1 Desc", "step_1_desc", "text"),
            ("Step 2 Number", "step_2_num", "text"),
            ("Step 2 Title", "step_2_title", "text"),
            ("Step 2 Desc", "step_2_desc", "text"),
            ("Step 3 Number", "step_3_num", "text"),
            ("Step 3 Title", "step_3_title", "text"),
            ("Step 3 Desc", "step_3_desc", "text"),
        ],
    },
    {
        "name": "Blog Preview",
        "slug": "blog_preview",
        "description": "Feature your latest blog posts, news, or articles to keep readers engaged.",
        "fields": [
            ("Heading", "heading", "text"),
            ("Article 1 Image", "art_1_img", "image"),
            ("Article 1 Title", "art_1_title", "text"),
            ("Article 1 Category", "art_1_cat", "text"),
            ("Article 1 Link", "art_1_link", "text"),
            ("Article 2 Image", "art_2_img", "image"),
            ("Article 2 Title", "art_2_title", "text"),
            ("Article 2 Category", "art_2_cat", "text"),
            ("Article 2 Link", "art_2_link", "text"),
        ],
    },
    {
        "name": "Comparison Table",
        "slug": "comparison_table",
        "description": "Deep feature comparison table to stack your product up against competitors.",
        "fields": [
            ("Title", "title", "text"),
            ("Competitor Name", "competitor_name", "text"),
            ("Feature 1 Name", "feat_1_name", "text"),
            ("Feature 1 Us", "feat_1_us", "text"),
            ("Feature 1 Them", "feat_1_them", "text"),
            ("Feature 2 Name", "feat_2_name", "text"),
            ("Feature 2 Us", "feat_2_us", "text"),
            ("Feature 2 Them", "feat_2_them", "text"),
            ("Feature 3 Name", "feat_3_name", "text"),
            ("Feature 3 Us", "feat_3_us", "text"),
            ("Feature 3 Them", "feat_3_them", "text"),
        ],
    },
    {
        "name": "Bento Grid",
        "slug": "bento_grid",
        "description": "A modern, asymmetrical panel grid inspired by the latest Apple & Vercel interfaces.",
        "fields": [
            ("Title", "title", "text"),
            ("Panel 1 Title", "p1_title", "text"),
            ("Panel 1 Image", "p1_img", "image"),
            ("Panel 1 Desc", "p1_desc", "text"),
            ("Panel 2 Title", "p2_title", "text"),
            ("Panel 2 Image", "p2_img", "image"),
            ("Panel 2 Desc", "p2_desc", "text"),
            ("Panel 3 Title", "p3_title", "text"),
            ("Panel 3 Image", "p3_img", "image"),
            ("Panel 3 Desc", "p3_desc", "text"),
        ],
    },
    {
        "name": "Product Showcase",
        "slug": "product_showcase",
        "description": "An interactive or feature-rich display of your physical or digital product with specs.",
        "fields": [
            ("Heading", "heading", "text"),
            ("Subheading", "subheading", "text"),
            ("Image", "image", "image"),
            ("Feature 1", "feature_1", "text"),
            ("Feature 2", "feature_2", "text"),
            ("Feature 3", "feature_3", "text"),
        ],
    },
    {
        "name": "App Download Section",
        "slug": "app_download",
        "description": "A device mockup paired with store badges to drive mobile app installs.",
        "fields": [
            ("Title", "title", "text"),
            ("Description", "description", "text"),
            ("Mockup Image", "mockup_image", "image"),
            ("App Store Link", "app_store_link", "text"),
            ("Play Store Link", "play_store_link", "text"),
        ],
    },
    {
        "name": "Case Studies",
        "slug": "case_studies",
        "description": "Showcase in-depth client successes with metrics, strategy, and results.",
        "fields": [
            ("Title", "title", "text"),
            ("Case 1 Title", "case_1_title", "text"),
            ("Case 1 Metric", "case_1_metric", "text"),
            ("Case 1 Image", "case_1_img", "image"),
            ("Case 1 Link", "case_1_link", "text"),
            ("Case 2 Title", "case_2_title", "text"),
            ("Case 2 Metric", "case_2_metric", "text"),
            ("Case 2 Image", "case_2_img", "image"),
            ("Case 2 Link", "case_2_link", "text"),
        ],
    },
    {
        "name": "Contact Section (Variant)",
        "slug": "contact_variant",
        "description": "A premium multi-office contact section with social links, map, and inquiry form teaser.",
        "fields": [
            ("Title", "title", "text"),
            ("Description", "description", "text"),
            ("Office 1 Name", "office_1_name", "text"),
            ("Office 1 Address", "office_1_addr", "text"),
            ("Office 2 Name", "office_2_name", "text"),
            ("Office 2 Address", "office_2_addr", "text"),
            ("Email", "email", "text"),
            ("Image", "image", "image"),
        ],
    },
    {
        "name": "Hero Glow Showcase",
        "slug": "hero_glow",
        "description": "SaaS landing opener featuring centralized copy, high-impact subtitle, dual buttons, and a giant glowing mockup screenshot container outlined with an elegant gradient border.",
        "fields": [
            ("Badge", "badge", "text"),
            ("Title", "title", "text"),
            ("Subtitle", "subtitle", "text"),
            ("Primary Button Text", "primary_btn_text", "text"),
            ("Primary Button Link", "primary_btn_link", "text"),
            ("Secondary Button Text", "secondary_btn_text", "text"),
            ("Secondary Button Link", "secondary_btn_link", "text"),
            ("Mockup Image", "mockup_image", "image"),
        ],
    },
    {
        "name": "Infinite Logo Marquee",
        "slug": "logo_marquee",
        "description": "An infinitely sliding/scrolling logowall of grayscale partner brand names that light up on hover, styled precisely like Linear.",
        "fields": [
            ("Title", "title", "text"),
            ("Brand 1 Name", "brand_1", "text"),
            ("Brand 2 Name", "brand_2", "text"),
            ("Brand 3 Name", "brand_3", "text"),
            ("Brand 4 Name", "brand_4", "text"),
            ("Brand 5 Name", "brand_5", "text"),
            ("Brand 6 Name", "brand_6", "text"),
            ("Brand 7 Name", "brand_7", "text"),
            ("Brand 8 Name", "brand_8", "text"),
        ],
    },
    {
        "name": "Modern Callout Box",
        "slug": "callout_box",
        "description": "Elegant callout banner featuring custom accent icons, highlight borders, descriptive title, copy, and secondary buttons.",
        "fields": [
            ("Accent Icon", "accent_icon", "image"),
            ("Title", "title", "text"),
            ("Description", "description", "text"),
            ("Primary Button Text", "primary_btn_text", "text"),
            ("Primary Button Link", "primary_btn_link", "text"),
            ("Secondary Button Text", "secondary_btn_text", "text"),
            ("Secondary Button Link", "secondary_btn_link", "text"),
        ],
    },
    {
        "name": "Alternating Feature Split",
        "slug": "feature_split",
        "description": "High-end alternating split text-and-image feature layouts.",
        "fields": [
            ("Heading", "heading", "text"),
            ("Subheading", "subheading", "text"),
            ("Feature 1 Title", "feat_1_title", "text"),
            ("Feature 1 Description", "feat_1_desc", "text"),
            ("Feature 1 Image", "feat_1_img", "image"),
            ("Feature 1 Button Text", "feat_1_btn_text", "text"),
            ("Feature 1 Button Link", "feat_1_btn_link", "text"),
            ("Feature 2 Title", "feat_2_title", "text"),
            ("Feature 2 Description", "feat_2_desc", "text"),
            ("Feature 2 Image", "feat_2_img", "image"),
            ("Feature 2 Button Text", "feat_2_btn_text", "text"),
            ("Feature 2 Button Link", "feat_2_btn_link", "text"),
        ],
    },
]


DEMO_VALUES = {
    "hero": {
        "title": "Launch a polished site before the coffee cools",
        "subtitle": "InstaWeb turns reusable sections into fast, modern websites that stay easy to edit.",
        "background_image": "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80",
    },
    "about": {
        "heading": "Built for founders, studios, and small teams",
        "description": "Use a lightweight builder that keeps your content structured without dragging you into theme maintenance or plugin sprawl.",
        "image": "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80",
    },
    "services": {
        "service_1_name": "Landing Pages",
        "service_1_icon": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80",
        "service_2_name": "Portfolio Sites",
        "service_2_icon": "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=600&q=80",
        "service_3_name": "Content Hubs",
        "service_3_icon": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
    },
    "contact": {
        "title": "Let’s build something sharp",
        "email": "hello@instaweb.io",
        "phone": "+62 812 0000 2026",
        "map_image": "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80",
    },
    "footer": {
        "copyright_text": "© 2026 InstaWeb. Built with structured sections.",
        "logo_url": "https://dummyimage.com/160x64/111827/ffffff&text=InstaWeb",
        "instagram_link": "https://instagram.com/instaweb",
        "facebook_link": "https://facebook.com/instaweb",
    },
    "navbar": {
        "logo_url": "https://dummyimage.com/160x64/111827/ffffff&text=InstaWeb",
        "logo_text": "InstaWeb",
        "link_1_text": "Features",
        "link_1_url": "#features",
        "link_2_text": "Pricing",
        "link_2_url": "#pricing",
        "link_3_text": "FAQ",
        "link_3_url": "#faq",
        "cta_text": "Get Started",
        "cta_link": "/signup",
    },
    "hero_variant": {
        "badge": "NEW: INSTAWEB V2.0 HAS ARRIVED",
        "title": "The design engine for high-velocity startups",
        "subtitle": "Stop wrestling with rigid drag-and-drop builders. InstaWeb gives your marketing team total control with beautiful structural consistency.",
        "primary_btn_text": "Deploy Your Site",
        "primary_btn_link": "/signup",
        "secondary_btn_text": "Book a Demo",
        "secondary_btn_link": "/demo",
        "preview_image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    },
    "feature_grid": {
        "heading": "Engineered for speed, built for style",
        "subheading": "Every detail has been polished to perfection, ensuring your brand stands out with elite aesthetics.",
        "feat_1_icon": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=120&q=80",
        "feat_1_title": "Hot-Module Reloading",
        "feat_1_desc": "See edits instantly without page refreshes. Our state synchronization is seamless.",
        "feat_2_icon": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=120&q=80",
        "feat_2_title": "Secure by Default",
        "feat_2_desc": "Enterprise-grade safety with rigid data sandboxes and continuous automated vulnerability scans.",
        "feat_3_icon": "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=120&q=80",
        "feat_3_title": "Elite Typography",
        "feat_3_desc": "Curated typeface hierarchies that instantly elevate your brand layout authority.",
        "feat_4_icon": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=120&q=80",
        "feat_4_title": "Global Edge CDN",
        "feat_4_desc": "Ultra-fast response times globally with assets cached at the network edge nearest your users.",
    },
    "stats": {
        "title": "Numbers that speak for themselves",
        "subtitle": "We've empowered thousands of design-focused teams around the globe.",
        "stat_1_val": "99.99%",
        "stat_1_label": "Uptime SLA",
        "stat_2_val": "142M+",
        "stat_2_label": "Requests / Day",
        "stat_3_val": "$2.4B+",
        "stat_3_label": "Transaction Volume",
        "stat_4_val": "12ms",
        "stat_4_label": "Global Edge Latency",
    },
    "logo_cloud": {
        "title": "Trusted by elite teams at hyper-growth tech companies",
        "logo_1": "https://dummyimage.com/180x60/f3f4f6/111827&text=Acme",
        "logo_2": "https://dummyimage.com/180x60/f3f4f6/111827&text=Vercel",
        "logo_3": "https://dummyimage.com/180x60/f3f4f6/111827&text=Linear",
        "logo_4": "https://dummyimage.com/180x60/f3f4f6/111827&text=Framer",
        "logo_5": "https://dummyimage.com/180x60/f3f4f6/111827&text=Stripe",
        "logo_6": "https://dummyimage.com/180x60/f3f4f6/111827&text=Retool",
    },
    "testimonials": {
        "heading": "Loved by founders worldwide",
        "subheading": "Hear how scaling startups are using InstaWeb to command market attention.",
        "quote_1": "InstaWeb completely changed how our product marketing operates. We deployed our complete V2 landing page in under a single morning.",
        "author_1_name": "Sarah Jenkins",
        "author_1_role": "VP of Marketing, Linear",
        "author_1_avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
        "quote_2": "The structural layout limits ensure our brand stays gorgeous no matter who on the team is writing copy or updating imagery.",
        "author_2_name": "Marcus Chen",
        "author_2_role": "Co-Founder, Framer",
        "author_2_avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    },
    "pricing": {
        "title": "Flexible pricing for teams of all sizes",
        "subtitle": "Simple, transparent, scale-friendly packages with no hidden surprises.",
        "plan_1_name": "Developer",
        "plan_1_price": "$0",
        "plan_1_features": "3 Pages, Basic Analytics, Standard CDN Support, Community Forum Access",
        "plan_1_cta": "Start Free",
        "plan_2_name": "Growth Pro",
        "plan_2_price": "$49",
        "plan_2_features": "Unlimited Pages, Advanced Real-Time Analytics, Custom Roles & Permissions, 24/7 Priority Support",
        "plan_2_cta": "Unlock Growth Pro",
        "plan_2_badge": "MOST POPULAR",
    },
    "faq": {
        "heading": "Answers to your questions",
        "subheading": "Can't find what you are looking for? Reach out to our global support crew.",
        "q1_question": "How does section-based editing work?",
        "q1_answer": "Instead of dragging freeform text boxes that break layout alignment, InstaWeb keeps your content fields structured. You input the text and images, and our elite design engine renders it perfectly across all viewports.",
        "q2_question": "Can I export my custom pages to static code?",
        "q2_answer": "Yes, absolutely! You can download your fully rendered React or HTML code with a single click, or deploy it directly to cloud hosts like Vercel.",
        "q3_question": "Is custom domain mapping supported?",
        "q3_answer": "Yes. Every site created with InstaWeb can be instantly mapped to your own custom domain with automated SSL certificates generated in seconds.",
        "q4_question": "Are there limits on media asset storage?",
        "q4_answer": "Our Growth Pro plan includes unlimited media uploads backed by our lightning-fast global CDN, ensuring top-tier loading speeds.",
    },
    "cta": {
        "heading": "Ready to claim your market share?",
        "description": "Start launching high-fidelity pages today. No credit card required.",
        "primary_btn_text": "Start Building Now",
        "primary_btn_link": "/signup",
        "secondary_btn_text": "Schedule a Call",
        "secondary_btn_link": "/contact",
    },
    "newsletter": {
        "title": "Join our weekly digest",
        "description": "Stay updated with design trends, startup playbooks, and exclusive product releases.",
        "input_placeholder": "Enter your work email address",
        "button_text": "Subscribe",
        "privacy_notice": "We promise not to spam. Unsubscribe anytime in one click.",
    },
    "portfolio": {
        "title": "Curated Selected Works",
        "subtitle": "Explore recent digital product launches and interactive campaigns built by our design network.",
        "proj_1_img": "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
        "proj_1_title": "Aether: Decentralized Lending Engine",
        "proj_1_cat": "FINTECH BRANDING",
        "proj_2_img": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
        "proj_2_title": "Oasis: Headless Commerce System",
        "proj_2_cat": "E-COMMERCE DESIGN",
        "proj_3_img": "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=800&q=80",
        "proj_3_title": "Helios: Solar Grid Operating App",
        "proj_3_cat": "MOBILE INTERACTION",
    },
    "gallery": {
        "heading": "Life inside the Studio",
        "subheading": "A peek behind the scenes at our collaborative workspaces and design sprints.",
        "image_1": "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
        "image_2": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
        "image_3": "https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?auto=format&fit=crop&w=800&q=80",
        "image_4": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
    },
    "team": {
        "title": "Meet our creative leads",
        "subtitle": "A globally distributed team of master craftspeople dedicated to outstanding design.",
        "member_1_name": "Elena Rostova",
        "member_1_role": "Principal Design Lead",
        "member_1_img": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80",
        "member_2_name": "Julian Vance",
        "member_2_role": "Chief Brand Architect",
        "member_2_img": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80",
        "member_3_name": "Aiko Tanaka",
        "member_3_role": "Interaction Engineer",
        "member_3_img": "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
    },
    "timeline": {
        "title": "Our Journey So Far",
        "mile_1_year": "2024",
        "mile_1_title": "Founding & $2M Seed",
        "mile_1_desc": "Launched our primary layout engine prototype and secured backing from premier design-focused VCs.",
        "mile_2_year": "2025",
        "mile_2_title": "InstaWeb V1.0 Launch",
        "mile_2_desc": "Publicly released our platform, onboarding over 10,000 active startup marketing teams within months.",
        "mile_3_year": "2026",
        "mile_3_title": "Series A & Global CDN Expansion",
        "mile_3_desc": "Raised $15M to expand our lightning-fast edge infrastructure and deploy AI-assisted layout modules.",
    },
    "process_steps": {
        "title": "How we elevate your startup",
        "step_1_num": "01",
        "step_1_title": "Design Audit",
        "step_1_desc": "We analyze your target market and existing brand assets to structure high-impact sections.",
        "step_2_num": "02",
        "step_2_title": "Modular Build",
        "step_2_desc": "Assemble your layouts instantly using our premium component templates without code bloat.",
        "step_3_num": "03",
        "step_3_title": "Deploy to Edge",
        "step_3_desc": "Publish globally in one click to a high-speed CDN with flawless mobile optimization.",
    },
    "blog_preview": {
        "heading": "Perspectives on modern product design",
        "art_1_img": "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=600&q=80",
        "art_1_title": "Why rigid grid structures beat absolute positioning",
        "art_1_cat": "DESIGN THEORY",
        "art_1_link": "/blog/grid-structures",
        "art_2_img": "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80",
        "art_2_title": "Optimizing web performance for ultra-fast startup conversions",
        "art_2_cat": "ENGINEERING",
        "art_2_link": "/blog/web-performance",
    },
    "comparison_table": {
        "title": "Why modern builders fall short",
        "competitor_name": "Traditional Site Builders",
        "feat_1_name": "Brand-safe structure control",
        "feat_1_us": "Rigid layout guarantees perfection",
        "feat_1_them": "Freeform drag breaks responsive views",
        "feat_2_name": "Edge CDN delivery standard",
        "feat_2_us": "Fully automated worldwide edge hosting",
        "feat_2_them": "Bulky server setups or extra plugin fees",
        "feat_3_name": "API-first data structures",
        "feat_3_us": "Fully exportable as JSON or React code",
        "feat_3_them": "Locked into proprietary platform hosting",
    },
    "bento_grid": {
        "title": "Crafted with modular precision",
        "p1_title": "Lightning-Fast Execution",
        "p1_img": "https://images.unsplash.com/photo-1542744094-2ab25be78b90?auto=format&fit=crop&w=400&q=80",
        "p1_desc": "Optimized React server templates render your dynamic sections in milliseconds.",
        "p2_title": "Elite Typography Controls",
        "p2_img": "https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=400&q=80",
        "p2_desc": "Perfect baseline alignment and font smoothing across every screen ratio.",
        "p3_title": "Real-time Site Analytics",
        "p3_img": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=400&q=80",
        "p3_desc": "Observe visitor flows and section engagement values in a beautiful, unified admin panel.",
    },
    "product_showcase": {
        "heading": "Immersive Studio Console",
        "subheading": "A distraction-free interface built to maximize design productivity.",
        "image": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1000&q=80",
        "feature_1": "Dark-mode default layout optimized for long creative sessions",
        "feature_2": "Command palette shortcuts to jump between sections in a heartbeat",
        "feature_3": "Granular revision history with instant point-in-time rollbacks",
    },
    "app_download": {
        "title": "Control your brand on the go",
        "description": "Download the mobile dashboard to publish updates, view real-time traffic statistics, and approve draft changes directly from your phone.",
        "mockup_image": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80",
        "app_store_link": "https://apple.com/app-store",
        "play_store_link": "https://play.google.com/store",
    },
    "case_studies": {
        "title": "Hyper-growth success stories",
        "case_1_title": "Aether FinTech converts $40M in initial campaign run",
        "case_1_metric": "312% Conversion Jump",
        "case_1_img": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80",
        "case_1_link": "/cases/aether",
        "case_2_title": "Oasis Commerce reduces time-to-market down to 3 days",
        "case_2_metric": "85% Development Savings",
        "case_2_img": "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80",
        "case_2_link": "/cases/oasis",
    },
    "contact_variant": {
        "title": "Let’s start a conversation",
        "description": "Have an enterprise inquiry or custom project scope? Our core design team is ready to assist.",
        "office_1_name": "San Francisco Headquarters",
        "office_1_addr": "256 Townsend St, San Francisco, CA 94107",
        "office_2_name": "London Workspace",
        "office_2_addr": "32 Broadwick St, London W1F 8JB, United Kingdom",
        "email": "partnerships@instaweb.io",
        "image": "https://images.unsplash.com/photo-1497366858526-0766cadbe8fa?auto=format&fit=crop&w=800&q=80",
    },
    "hero_glow": {
        "badge": "INTRODUCING INSTAWEB GLOW",
        "title": "Illuminate Your Product's True Potential",
        "subtitle": "Captivate your audience with a striking high-impact presentation. Designed specifically for forward-thinking SaaS teams who demand gorgeous design consistency.",
        "primary_btn_text": "Start Building",
        "primary_btn_link": "#",
        "secondary_btn_text": "Watch Demo Video",
        "secondary_btn_link": "#",
        "mockup_image": "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80",
    },
    "logo_marquee": {
        "title": "INTEGRATES SEAMLESSLY WITH MODERN WORKFLOWS",
        "brand_1": "Acme Corp",
        "brand_2": "Linear",
        "brand_3": "Vercel",
        "brand_4": "Stripe",
        "brand_5": "Framer",
        "brand_6": "Retool",
        "brand_7": "GitHub",
        "brand_8": "Slack",
    },
    "callout_box": {
        "accent_icon": "https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&fit=crop&w=120&q=80",
        "title": "Unleash high-velocity marketing campaigns today",
        "description": "Unlock enterprise security, priority queue rendering, custom layout domains, and advanced bento grids with our modern site builder.",
        "primary_btn_text": "Upgrade to Enterprise",
        "primary_btn_link": "#",
        "secondary_btn_text": "Contact Relations",
        "secondary_btn_link": "#",
    },
    "feature_split": {
        "heading": "Engineered down to the pixel",
        "subheading": "Experience standard-setting interface speeds, gorgeous color matching, and design control built specifically for modern companies.",
        "feat_1_title": "Pixel-Perfect Responsive Editor",
        "feat_1_desc": "Create components that dynamically resize across mobile, tablet, and ultra-wide screens. Our layout constraints ensure your content never breaks or spills out.",
        "feat_1_img": "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
        "feat_1_btn_text": "Learn More",
        "feat_1_btn_link": "#",
        "feat_2_title": "Global Fast Edge Delivery",
        "feat_2_desc": "Deploy instantly to a global network. Assets are automatically optimized, cached near your customers, and loaded under 100ms globally.",
        "feat_2_img": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
        "feat_2_btn_text": "Explore Infrastructure",
        "feat_2_btn_link": "#",
    },
}


# Add three styling fields to ALL templates in the seed dataset
for template in TEMPLATES:
    template["fields"].extend([
        ("Background Style", "style_bg", "text"),
        ("Padding Size", "style_padding", "text"),
        ("Highlight Text Color", "style_text_color", "text"),
    ])

# Supply beautiful, harmonized style choices as defaults in DEMO_VALUES for all templates
HARMONIZED_STYLES = {
    "navbar": {"style_bg": "glass", "style_padding": "none", "style_text_color": "brand-aqua"},
    "footer": {"style_bg": "dark", "style_padding": "compact", "style_text_color": "brand-muted"},
    "hero": {"style_bg": "dark", "style_padding": "cozy", "style_text_color": "brand-aqua"},
    "hero_variant": {"style_bg": "dark", "style_padding": "cozy", "style_text_color": "brand-aqua"},
    "cta": {"style_bg": "brand-gradient", "style_padding": "comfortable", "style_text_color": "white"},
    "pricing": {"style_bg": "dark", "style_padding": "cozy", "style_text_color": "brand-teal"},
    "testimonials": {"style_bg": "dark-variant", "style_padding": "cozy", "style_text_color": "brand-aqua"},
    "faq": {"style_bg": "dark", "style_padding": "cozy", "style_text_color": "brand-teal"},
    "newsletter": {"style_bg": "dark-variant", "style_padding": "cozy", "style_text_color": "brand-aqua"},
    "stats": {"style_bg": "dark", "style_padding": "comfortable", "style_text_color": "brand-teal"},
    "logo_cloud": {"style_bg": "dark-variant", "style_padding": "compact", "style_text_color": "brand-muted"},
    "hero_glow": {"style_bg": "dark", "style_padding": "comfortable", "style_text_color": "brand-aqua"},
    "logo_marquee": {"style_bg": "dark-variant", "style_padding": "compact", "style_text_color": "brand-muted"},
    "callout_box": {"style_bg": "dark-variant", "style_padding": "cozy", "style_text_color": "brand-aqua"},
    "feature_split": {"style_bg": "dark", "style_padding": "comfortable", "style_text_color": "brand-teal"},
}

for key, values in DEMO_VALUES.items():
    styles = HARMONIZED_STYLES.get(key, {"style_bg": "dark", "style_padding": "cozy", "style_text_color": "brand-aqua"})
    values.update(styles)


def seed_templates():
    for order, template_payload in enumerate(TEMPLATES, start=1):
        template = Template.query.filter_by(slug=template_payload["slug"]).first()
        if template is None:
            template = Template(
                name=template_payload["name"],
                slug=template_payload["slug"],
                description=template_payload["description"],
            )
            db.session.add(template)
            db.session.flush()
        else:
            template.name = template_payload["name"]
            template.description = template_payload["description"]

        existing_fields = {field.slug: field for field in template.fields}
        for name, slug, field_type in template_payload["fields"]:
            field = existing_fields.get(slug)
            if field is None:
                db.session.add(
                    TemplateField(
                        template_id=template.id,
                        name=name,
                        slug=slug,
                        type=field_type,
                    )
                )
            else:
                field.name = name
                field.type = field_type
    db.session.commit()


def seed_demo_data():
    accounts = [
        ("Super Admin", "super@instaweb.io", "password", "super_admin"),
        ("Admin", "admin@instaweb.io", "password", "admin"),
        ("Demo User", "demo@instaweb.io", "password", "user"),
    ]
    for name, email, password, role in accounts:
        user = User.query.filter_by(email=email).first()
        if user is None:
            user = User(name=name, email=email, role=role)
            user.set_password(password)
            db.session.add(user)
        else:
            user.name = name
            user.role = role

    db.session.commit()

    demo_user = User.query.filter_by(email="demo@instaweb.io").first()
    if not demo_user:
        return

    existing_page = Page.query.filter_by(slug="startup-studio").first()
    if existing_page:
        # Clear existing page sections first to allow the showcase of the new sections!
        for section in existing_page.sections:
            db.session.delete(section)
        db.session.commit()
        page = existing_page
    else:
        page = Page(
            user_id=demo_user.id,
            title="Startup Studio",
            slug="startup-studio",
            summary="A published demo site assembled from dynamic InstaWeb sections.",
            is_published=True,
            published_at=datetime.utcnow(),
        )
        db.session.add(page)
        db.session.flush()

    new_sections = [
        "navbar",
        "hero_variant",
        "logo_cloud",
        "feature_grid",
        "bento_grid",
        "pricing",
        "testimonials",
        "faq",
        "cta",
        "footer",
    ]
    for position, template_slug in enumerate(new_sections, start=1):
        template = Template.query.filter_by(slug=template_slug).first()
        if not template:
            continue
        section = PageSection(page_id=page.id, template_id=template.id, position=position)
        db.session.add(section)
        db.session.flush()
        values = DEMO_VALUES[template_slug]
        for field in template.fields:
            db.session.add(
                SectionFieldValue(
                    page_section_id=section.id,
                    template_field_id=field.id,
                    value=values.get(field.slug),
                )
            )
    db.session.commit()
