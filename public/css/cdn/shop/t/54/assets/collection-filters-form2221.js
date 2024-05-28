class FacetFiltersForm extends HTMLElement{constructor(){super(),this.onActiveFilterClick=this.onActiveFilterClick.bind(this),this.debouncedOnSubmit=debounce(event=>{this.onSubmitHandler(event)},500),this.querySelector(".product-filter__form").addEventListener("input",this.debouncedOnSubmit.bind(this));const facetWrapper=this.querySelector("#FacetsWrapperDesktop");facetWrapper&&facetWrapper.addEventListener("keyup",onKeyUpEscape)}static setListeners(){const onHistoryChange=event=>{const searchParams=event.state?event.state.searchParams:FacetFiltersForm.searchParamsInitial;searchParams!==FacetFiltersForm.searchParamsPrev&&FacetFiltersForm.renderPage(searchParams,null,!1)};window.addEventListener("popstate",onHistoryChange)}static toggleActiveFacets(disable=!0){document.querySelectorAll(".js-facet-remove").forEach(element=>{element.classList.toggle("disabled",disable)})}static renderPage(searchParams,event,updateURLHash=!0){FacetFiltersForm.searchParamsPrev=searchParams;const sections=FacetFiltersForm.getSections(),countContainer=document.getElementById("ProductCount"),countContainerDesktop=document.getElementById("ProductCountDesktop");document.getElementById("ProductGridContainer").querySelector(".collection").classList.add("loading"),countContainer&&countContainer.classList.add("loading"),countContainerDesktop&&countContainerDesktop.classList.add("loading"),sections.forEach(section=>{const url=`${window.location.pathname}?section_id=${section.section}&${searchParams}`,filterDataUrl=element=>element.url===url;FacetFiltersForm.filterData.some(filterDataUrl)?FacetFiltersForm.renderSectionFromCache(filterDataUrl,event):FacetFiltersForm.renderSectionFromFetch(url,event)}),updateURLHash&&FacetFiltersForm.updateURLHash(searchParams)}static renderSectionFromFetch(url,event){fetch(url).then(response=>response.text()).then(responseText=>{const html=responseText;FacetFiltersForm.filterData=[...FacetFiltersForm.filterData,{html,url}],FacetFiltersForm.renderFilters(html,event),FacetFiltersForm.renderProductGridContainer(html),FacetFiltersForm.renderProductCount(html)})}static renderSectionFromCache(filterDataUrl,event){const html=FacetFiltersForm.filterData.find(filterDataUrl).html;FacetFiltersForm.renderFilters(html,event),FacetFiltersForm.renderProductGridContainer(html),FacetFiltersForm.renderProductCount(html)}static renderProductGridContainer(html){document.getElementById("ProductGridContainer").innerHTML=new DOMParser().parseFromString(html,"text/html").getElementById("ProductGridContainer").innerHTML,FacetFiltersForm.updateWishlist(),FacetFiltersForm.ajaxFilterReview(),vela.swatchProduct()}static renderProductCount(html){const count=new DOMParser().parseFromString(html,"text/html").getElementById("ProductCount").innerHTML,container=document.getElementById("ProductCount"),containerDesktop=document.getElementById("ProductCountDesktop");container.innerHTML=count,container.classList.remove("loading"),containerDesktop&&(containerDesktop.innerHTML=count,containerDesktop.classList.remove("loading"))}static renderFilters(html,event){const parsedHTML=new DOMParser().parseFromString(html,"text/html"),facetDetailsElements=parsedHTML.querySelectorAll("#FacetFiltersForm .js-filter"),matchesIndex=element=>{const jsFilter=event?event.target.closest(".js-filter"):void 0;return jsFilter?element.dataset.index===jsFilter.dataset.index:!1},facetsToRender=Array.from(facetDetailsElements).filter(element=>!matchesIndex(element)),countsToRender=Array.from(facetDetailsElements).find(matchesIndex);facetsToRender.forEach(element=>{document.querySelector(`.js-filter[data-index="${element.dataset.index}"]`).innerHTML=element.innerHTML}),FacetFiltersForm.renderActiveFacets(parsedHTML),countsToRender&&FacetFiltersForm.renderCounts(countsToRender,event.target.closest(".js-filter"))}static renderActiveFacets(html){[".active-facets-desktop"].forEach(selector=>{const activeFacetsElement=html.querySelector(selector);activeFacetsElement&&(document.querySelector(selector).innerHTML=activeFacetsElement.innerHTML)}),FacetFiltersForm.toggleActiveFacets(!1)}static renderAdditionalElements(html){[".mobile-facets__open",".mobile-facets__count",".sorting"].forEach(selector=>{html.querySelector(selector)&&(document.querySelector(selector).innerHTML=html.querySelector(selector).innerHTML)}),document.getElementById("FacetFiltersFormMobile").closest("menu-drawer").bindEvents()}static renderCounts(source,target){const targetElement=target.querySelector(".facets__selected");source.querySelector(".facets__selected")&&targetElement&&(target.querySelector(".facets__selected").outerHTML=source.querySelector(".facets__selected").outerHTML)}static ajaxFilterReview(){if(window.SPR&&vela.settings.enableReview&&$(".shopify-product-reviews-badge").length>0)return window.SPR.registerCallbacks(),window.SPR.initRatingHandler(),window.SPR.initDomEls(),window.SPR.loadProducts(),window.SPR.loadBadges()}static updateWishlist(){initButtons()}static updateURLHash(searchParams){history.pushState({searchParams},"",`${window.location.pathname}${searchParams&&"?".concat(searchParams)}`)}static getSections(){return[{section:document.getElementById("main-collection-product-grid").dataset.id}]}onSubmitHandler(event){event.preventDefault();const formData=new FormData(event.target.closest("form")),searchParams=new URLSearchParams(formData).toString();FacetFiltersForm.renderPage(searchParams,event)}onActiveFilterClick(event){event.preventDefault(),FacetFiltersForm.toggleActiveFacets();const url=event.currentTarget.href.indexOf("?")==-1?"":event.currentTarget.href.slice(event.currentTarget.href.indexOf("?")+1);FacetFiltersForm.renderPage(url)}}FacetFiltersForm.filterData=[],FacetFiltersForm.searchParamsInitial=window.location.search.slice(1),FacetFiltersForm.searchParamsPrev=window.location.search.slice(1),customElements.define("facet-filters-form",FacetFiltersForm),FacetFiltersForm.setListeners();class PriceRange extends HTMLElement{constructor(){super(),this.querySelectorAll("input").forEach(element=>element.addEventListener("change",this.onRangeChange.bind(this))),this.setMinAndMaxValues(),this.ionRangeSlider()}onRangeChange(event){this.adjustToValidValues(event.currentTarget),this.setMinAndMaxValues(),this.ionRangeSlider()}setMinAndMaxValues(){const inputs=this.querySelectorAll("input"),minInput=inputs[0],maxInput=inputs[1];maxInput.value&&minInput.setAttribute("max",maxInput.value),minInput.value&&maxInput.setAttribute("min",minInput.value),minInput.value===""&&maxInput.setAttribute("min",0),maxInput.value===""&&minInput.setAttribute("max",maxInput.getAttribute("max"))}adjustToValidValues(input){const value=Number(input.value),min=Number(input.getAttribute("min")),max=Number(input.getAttribute("max"));value<min&&(input.value=min),value>max&&(input.value=max)}ionRangeSlider(){var $range=$("#slider-range"),$inputFrom=$("#min_price"),$inputTo=$("#max_price"),min=$range.data("min"),max=$range.data("max"),prefix=$range.data("prefix"),from=$inputFrom.val()?$inputFrom.val():0,to=$inputTo.val()?$inputTo.val():max;$range.ionRangeSlider({skin:"round",type:"double",min,max,from,to,grid:!0,prefix,onFinish:updateInputs});function updateInputs(data){from=data.from,to=data.to,$inputFrom.val(from),$inputTo.val(to),document.getElementById("CollectionFiltersForm").dispatchEvent(new Event("input"))}}}customElements.define("price-range",PriceRange);class FacetRemove extends HTMLElement{constructor(){super(),this.querySelector("a").addEventListener("click",event=>{event.preventDefault(),(this.closest("facet-filters-form")||document.querySelector("facet-filters-form")).onActiveFilterClick(event)})}}customElements.define("facet-remove",FacetRemove);
//# sourceMappingURL=/cdn/shop/t/54/assets/collection-filters-form.js.map?v=64463666072720457241692439043
