function getFocusableElements(container){return Array.from(container.querySelectorAll("summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"))}document.querySelectorAll('[id^="Details-"] summary').forEach(summary=>{summary.setAttribute("role","button"),summary.setAttribute("aria-expanded","false"),summary.nextElementSibling.getAttribute("id")&&summary.setAttribute("aria-controls",summary.nextElementSibling.id),summary.addEventListener("click",event=>{event.currentTarget.setAttribute("aria-expanded",!event.currentTarget.closest("details").hasAttribute("open"))}),summary.parentElement.addEventListener("keyup",onKeyUpEscape)});const trapFocusHandlers={};function trapFocus(container,elementToFocus=container){var elements=getFocusableElements(container),first=elements[0],last=elements[elements.length-1];removeTrapFocus(),trapFocusHandlers.focusin=event=>{event.target!==container&&event.target!==last&&event.target!==first||document.addEventListener("keydown",trapFocusHandlers.keydown)},trapFocusHandlers.focusout=function(){document.removeEventListener("keydown",trapFocusHandlers.keydown)},trapFocusHandlers.keydown=function(event){event.code.toUpperCase()==="TAB"&&(event.target===last&&!event.shiftKey&&(event.preventDefault(),first.focus()),(event.target===container||event.target===first)&&event.shiftKey&&(event.preventDefault(),last.focus()))},document.addEventListener("focusout",trapFocusHandlers.focusout),document.addEventListener("focusin",trapFocusHandlers.focusin),elementToFocus.focus()}try{document.querySelector(":focus-visible")}catch{focusVisiblePolyfill()}function focusVisiblePolyfill(){const navKeys=["ARROWUP","ARROWDOWN","ARROWLEFT","ARROWRIGHT","TAB","ENTER","SPACE","ESCAPE","HOME","END","PAGEUP","PAGEDOWN"];let currentFocusedElement=null,mouseClick=null;window.addEventListener("keydown",event=>{navKeys.includes(event.code.toUpperCase())&&(mouseClick=!1)}),window.addEventListener("mousedown",event=>{mouseClick=!0}),window.addEventListener("focus",()=>{currentFocusedElement&&currentFocusedElement.classList.remove("focused"),!mouseClick&&(currentFocusedElement=document.activeElement,currentFocusedElement.classList.add("focused"))},!0)}function pauseAllMedia(){document.querySelectorAll(".js-youtube").forEach(video=>{video.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}',"*")}),document.querySelectorAll(".js-vimeo").forEach(video=>{video.contentWindow.postMessage('{"method":"pause"}',"*")}),document.querySelectorAll("video").forEach(video=>video.pause()),document.querySelectorAll("product-model").forEach(model=>{model.modelViewerUI&&model.modelViewerUI.pause()})}function removeTrapFocus(elementToFocus=null){document.removeEventListener("focusin",trapFocusHandlers.focusin),document.removeEventListener("focusout",trapFocusHandlers.focusout),document.removeEventListener("keydown",trapFocusHandlers.keydown),elementToFocus&&elementToFocus.focus()}function onKeyUpEscape(event){if(event.code.toUpperCase()!=="ESCAPE")return;const openDetailsElement=event.target.closest("details[open]");if(!openDetailsElement)return;const summaryElement=openDetailsElement.querySelector("summary");openDetailsElement.removeAttribute("open"),summaryElement.setAttribute("aria-expanded",!1),summaryElement.focus()}class QuantityInput extends HTMLElement{constructor(){super(),this.input=this.querySelector("input"),this.changeEvent=new Event("change",{bubbles:!0}),this.querySelectorAll("button").forEach(button=>button.addEventListener("click",this.onButtonClick.bind(this)))}onButtonClick(event){event.preventDefault();const previousValue=this.input.value;event.target.name==="plus"?this.input.stepUp():this.input.stepDown(),previousValue!==this.input.value&&this.input.dispatchEvent(this.changeEvent)}}customElements.define("quantity-input",QuantityInput);function debounce(fn,wait){let t;return(...args)=>{clearTimeout(t),t=setTimeout(()=>fn.apply(this,args),wait)}}function fetchConfig(type="json"){return{method:"POST",headers:{"Content-Type":"application/json",Accept:`application/${type}`}}}class MenuDrawer extends HTMLElement{constructor(){super(),this.mainDetailsToggle=this.querySelector("details"),navigator.platform==="iPhone"&&document.documentElement.style.setProperty("--viewport-height",`${window.innerHeight}px`),this.addEventListener("keyup",this.onKeyUp.bind(this)),this.addEventListener("focusout",this.onFocusOut.bind(this)),this.bindEvents()}bindEvents(){this.querySelectorAll("summary").forEach(summary=>summary.addEventListener("click",this.onSummaryClick.bind(this))),this.querySelectorAll("button").forEach(button=>button.addEventListener("click",this.onCloseButtonClick.bind(this)))}onKeyUp(event){if(event.code.toUpperCase()!=="ESCAPE")return;const openDetailsElement=event.target.closest("details[open]");openDetailsElement&&(openDetailsElement===this.mainDetailsToggle?this.closeMenuDrawer(this.mainDetailsToggle.querySelector("summary")):this.closeSubmenu(openDetailsElement))}onSummaryClick(event){const summaryElement=event.currentTarget,detailsElement=summaryElement.parentNode,isOpen=detailsElement.hasAttribute("open");detailsElement===this.mainDetailsToggle?(isOpen&&event.preventDefault(),isOpen?this.closeMenuDrawer(summaryElement):this.openMenuDrawer(summaryElement)):(trapFocus(summaryElement.nextElementSibling,detailsElement.querySelector("button")),setTimeout(()=>{detailsElement.classList.add("menu-opening"),summaryElement.setAttribute("aria-expanded",!0)}))}openMenuDrawer(summaryElement){setTimeout(()=>{this.mainDetailsToggle.classList.add("menu-opening")}),summaryElement.setAttribute("aria-expanded",!0),trapFocus(this.mainDetailsToggle,summaryElement),document.body.classList.add("overflow-hidden")}closeMenuDrawer(event,elementToFocus=!1){event!==void 0&&(this.mainDetailsToggle.classList.remove("menu-opening"),this.mainDetailsToggle.querySelectorAll("details").forEach(details=>{details.removeAttribute("open"),details.classList.remove("menu-opening")}),this.mainDetailsToggle.querySelector("summary").setAttribute("aria-expanded",!1),document.body.classList.remove("overflow-hidden"),removeTrapFocus(elementToFocus),this.closeAnimation(this.mainDetailsToggle))}onFocusOut(event){setTimeout(()=>{this.mainDetailsToggle.hasAttribute("open")&&!this.mainDetailsToggle.contains(document.activeElement)&&this.closeMenuDrawer()})}onCloseButtonClick(event){const detailsElement=event.currentTarget.closest("details");this.closeSubmenu(detailsElement)}closeSubmenu(detailsElement){detailsElement.classList.remove("menu-opening"),detailsElement.querySelector("summary").setAttribute("aria-expanded",!1),removeTrapFocus(),this.closeAnimation(detailsElement)}closeAnimation(detailsElement){let animationStart;const handleAnimation=time=>{animationStart===void 0&&(animationStart=time),time-animationStart<400?window.requestAnimationFrame(handleAnimation):(detailsElement.removeAttribute("open"),detailsElement.closest("details[open]")&&trapFocus(detailsElement.closest("details[open]"),detailsElement.querySelector("summary")))};window.requestAnimationFrame(handleAnimation)}}customElements.define("menu-drawer",MenuDrawer);class HeaderDrawer extends MenuDrawer{constructor(){super()}openMenuDrawer(summaryElement){this.header=this.header||document.getElementById("shopify-section-header"),setTimeout(()=>{this.mainDetailsToggle.classList.add("menu-opening")}),summaryElement.setAttribute("aria-expanded",!0),trapFocus(this.mainDetailsToggle,summaryElement),document.body.classList.add("overflow-hidden")}}customElements.define("header-drawer",HeaderDrawer);class ModalDialog extends HTMLElement{constructor(){super(),this.querySelector('[id^="ModalClose-"]').addEventListener("click",this.hide.bind(this)),this.addEventListener("keyup",event=>{event.code.toUpperCase()==="ESCAPE"&&this.hide()}),this.classList.contains("media-modal")?this.addEventListener("pointerup",event=>{event.pointerType==="mouse"&&!event.target.closest("deferred-media, product-model")&&this.hide()}):this.addEventListener("click",event=>{event.target.nodeName==="MODAL-DIALOG"&&this.hide()})}show(opener){this.openedBy=opener;const popup=this.querySelector(".template-popup");document.body.classList.add("overflow-hidden"),this.setAttribute("open",""),popup&&popup.loadContent(),trapFocus(this,this.querySelector('[role="dialog"]')),window.pauseAllMedia()}hide(){document.body.classList.remove("overflow-hidden"),this.removeAttribute("open"),removeTrapFocus(this.openedBy),window.pauseAllMedia()}}customElements.define("modal-dialog",ModalDialog);class ModalOpener extends HTMLElement{constructor(){super();const button=this.querySelector("button");button&&button.addEventListener("click",()=>{const modal=document.querySelector(this.getAttribute("data-modal"));modal&&modal.show(button)})}}customElements.define("modal-opener",ModalOpener);class DeferredMedia extends HTMLElement{constructor(){super();const poster=this.querySelector('[id^="Deferred-Poster-"]');poster&&poster.addEventListener("click",this.loadContent.bind(this))}loadContent(){if(window.pauseAllMedia(),!this.getAttribute("loaded")){const content=document.createElement("div");content.appendChild(this.querySelector("template").content.firstElementChild.cloneNode(!0)),this.setAttribute("loaded",!0),this.appendChild(content.querySelector("video, model-viewer, iframe")).focus()}}}customElements.define("deferred-media",DeferredMedia);
//# sourceMappingURL=/cdn/shop/t/68/assets/global.js.map?v=38681825317760340971692842349
