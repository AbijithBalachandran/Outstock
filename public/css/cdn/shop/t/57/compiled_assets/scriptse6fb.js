(function(){var __sections__={};(function(){for(var i=0,s=document.getElementById("sections-script").getAttribute("data-sections").split(",");i<s.length;i++)__sections__[s[i]]=!0})(),function(){if(__sections__.header)try{class StickyHeader extends HTMLElement{constructor(){super()}connectedCallback(){this.header=document.querySelector(".section-header"),this.headerIsAlwaysSticky=this.getAttribute("data-sticky-type")==="always",this.headerBounds={},this.setHeaderHeight(),window.matchMedia("(max-width: 990px)").addEventListener("change",this.setHeaderHeight.bind(this)),this.headerIsAlwaysSticky&&this.header.classList.add("shopify-section-header-sticky"),this.currentScrollTop=0,this.preventReveal=!1,this.predictiveSearch=this.querySelector("predictive-search"),this.onScrollHandler=this.onScroll.bind(this),this.hideHeaderOnScrollUp=()=>this.preventReveal=!0,this.addEventListener("preventHeaderReveal",this.hideHeaderOnScrollUp),window.addEventListener("scroll",this.onScrollHandler,!1),this.createObserver()}setHeaderHeight(){document.documentElement.style.setProperty("--header-height",`${this.header.offsetHeight}px`)}disconnectedCallback(){this.removeEventListener("preventHeaderReveal",this.hideHeaderOnScrollUp),window.removeEventListener("scroll",this.onScrollHandler)}createObserver(){new IntersectionObserver((entries,observer2)=>{this.headerBounds=entries[0].intersectionRect,observer2.disconnect()}).observe(this.header)}onScroll(){const scrollTop=window.pageYOffset||document.documentElement.scrollTop;if(!(this.predictiveSearch&&this.predictiveSearch.isOpen)){if(scrollTop>this.currentScrollTop&&scrollTop>this.headerBounds.bottom){if(this.header.classList.add("scrolled-past-header"),this.preventHide)return;requestAnimationFrame(this.hide.bind(this))}else scrollTop<this.currentScrollTop&&scrollTop>this.headerBounds.bottom?(this.header.classList.add("scrolled-past-header"),this.preventReveal?(window.clearTimeout(this.isScrolling),this.isScrolling=setTimeout(()=>{this.preventReveal=!1},66),requestAnimationFrame(this.hide.bind(this))):requestAnimationFrame(this.reveal.bind(this))):scrollTop<=this.headerBounds.top&&(this.header.classList.remove("scrolled-past-header"),requestAnimationFrame(this.reset.bind(this)));this.currentScrollTop=scrollTop}}hide(){this.headerIsAlwaysSticky||this.header.classList.add("shopify-section-header-hidden","shopify-section-header-sticky")}reveal(){this.headerIsAlwaysSticky||(this.header.classList.add("shopify-section-header-sticky","animate"),this.header.classList.remove("shopify-section-header-hidden"))}reset(){this.headerIsAlwaysSticky||this.header.classList.remove("shopify-section-header-hidden","shopify-section-header-sticky","animate")}}customElements.define("sticky-header",StickyHeader)}catch(e){console.error(e)}}(),function(){if(__sections__["main-article-simple"])try{var sideBarLeft=document.getElementById("sidebar_left"),sideBarRight=document.getElementById("sidebar_right");update=()=>{window.innerWidth>1199?(sideBarLeft?.classList.remove("offcanvas","offcanvas-start"),sideBarRight?.classList.remove("offcanvas","offcanvas-end")):(sideBarLeft?.classList.add("offcanvas","offcanvas-start"),sideBarRight?.classList.add("offcanvas","offcanvas-end"))},(sideBarLeft!=null||sideBarRight!=null)&&(window.update(),window.addEventListener("resize",update))}catch(e){console.error(e)}}(),function(){if(__sections__["main-article"])try{var sideBarLeft=document.getElementById("sidebar_left"),sideBarRight=document.getElementById("sidebar_right");update=()=>{window.innerWidth>992?(sideBarLeft!=null&&(sideBarLeft.classList.remove("offcanvas","offcanvas-start"),sideBarLeft.classList.add("sticky-top")),sideBarRight!=null&&(sideBarRight.classList.remove("offcanvas","offcanvas-end"),sideBarRight.classList.add("sticky-top"))):(sideBarLeft!=null&&(sideBarLeft.classList.add("offcanvas","offcanvas-start"),sideBarLeft.classList.remove("sticky-top")),sideBarRight!=null&&(sideBarRight.classList.add("offcanvas","offcanvas-end"),sideBarRight.classList.remove("sticky-top")))},(sideBarLeft!=null||sideBarRight!=null)&&(window.update(),window.addEventListener("resize",update))}catch(e){console.error(e)}}(),function(){if(__sections__["main-blog-style1"])try{var sideBarLeft=document.getElementById("sidebar_left"),sideBarRight=document.getElementById("sidebar_right");update=()=>{window.innerWidth>1199?(sideBarLeft?.classList.remove("offcanvas","offcanvas-start"),sideBarRight?.classList.remove("offcanvas","offcanvas-end")):(sideBarLeft?.classList.add("offcanvas","offcanvas-start"),sideBarRight?.classList.add("offcanvas","offcanvas-end"))},(sideBarLeft!=null||sideBarRight!=null)&&(window.update(),window.addEventListener("resize",update))}catch(e){console.error(e)}}(),function(){if(__sections__["main-blog"])try{var sideBarLeft=document.getElementById("sidebar_left"),sideBarRight=document.getElementById("sidebar_right");update=()=>{window.innerWidth>992?(sideBarLeft!=null&&(sideBarLeft.classList.remove("offcanvas","offcanvas-start"),sideBarLeft.classList.add("sticky-top")),sideBarRight!=null&&(sideBarRight.classList.remove("offcanvas","offcanvas-end"),sideBarRight.classList.add("sticky-top"))):(sideBarLeft!=null&&(sideBarLeft.classList.add("offcanvas","offcanvas-start"),sideBarLeft.classList.remove("sticky-top")),sideBarRight!=null&&(sideBarRight.classList.add("offcanvas","offcanvas-end"),sideBarRight.classList.remove("sticky-top")))},(sideBarLeft!=null||sideBarRight!=null)&&(window.update(),window.addEventListener("resize",update))}catch(e){console.error(e)}}(),function(){if(__sections__["main-cart"])try{class CartNote extends HTMLElement{constructor(){super(),this.addEventListener("change",debounce(event=>{const body=JSON.stringify({note:event.target.value});fetch(`${routes.cart_update_url}`,{...fetchConfig(),body})},300))}}customElements.define("cart-note",CartNote)}catch(e){console.error(e)}}(),function(){if(__sections__["product-recommendations"])try{class ProductRecommendations extends HTMLElement{constructor(){super();const handleIntersection=(entries,observer)=>{entries[0].isIntersecting&&(observer.unobserve(this),fetch(this.dataset.url).then(response=>response.text()).then(text=>{const html=document.createElement("div");html.innerHTML=text;const recommendations=html.querySelector("product-recommendations");if(recommendations&&recommendations.innerHTML.trim().length&&(this.innerHTML=recommendations.innerHTML,initButtons(),vela.swatchProduct(),window.SPR&&vela.settings.enableReview))return window.SPR.registerCallbacks(),window.SPR.initRatingHandler(),window.SPR.initDomEls(),window.SPR.loadProducts(),window.SPR.loadBadges()}).catch(e=>{console.error(e)}))};new IntersectionObserver(handleIntersection.bind(this),{rootMargin:"0px 0px 200px 0px"}).observe(this)}}customElements.define("product-recommendations",ProductRecommendations)}catch(e){console.error(e)}}()})();
//# sourceMappingURL=/cdn/shop/t/57/compiled_assets/scripts.js.map?17432=
