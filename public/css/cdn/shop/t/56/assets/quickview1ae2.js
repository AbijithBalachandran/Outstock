vela.QuickView=function(){var selectors={body:"body",quickView:"[data-quickview]",quickViewTemplate:"#quickview-template",quickViewBtn:".js-btn-quickview",quickViewContainer:"[data-quickview-container]",quickViewClose:"[data-quickview-close]",quickViewImages:"[data-quickview-images]",quickViewReview:"[data-quickview-review]",quickviewVariant:".js-quickview-option-selector",originalSelectorId:"[data-quickview-variant]",quickViewProductPrice:".js-qv-product-price",quickViewProductPriceCompare:".js-qv-product-price-compare",quickViewSKU:"[data-quickview-sku]",quickViewAvaiable:".product-avaiable",quickViewAvaiableInStock:".product-avaiable--instock",quickViewAvaiableInStockText:".product-avaiable__text--instock",quickViewAvaiableOutStock:".product-avaiable--outstock",quickViewProductDetailsURL:".js-qv-product-details"},preOrder=!1;function QuickView(container){this.$container=$(container),this.cache={},this.productVariants=[],this.currentVariant={},this.cacheSelectors(),this.initializeEvents()}return QuickView.prototype=_.assignIn({},QuickView.prototype,{cacheSelectors:function(){this.cache={$body:$("body"),$quickViewContainer:this.$container.find(selectors.quickViewContainer)}},initializeEvents:function(){var $this=this;$(selectors.body).on("click",selectors.quickViewBtn,function(e){e.preventDefault();var productHandle=$(this).data("handle");preOrder=$(this).data("preorder"),colorLabel=$(this).data("color-label")?$(this).data("color-label"):"";var shortProductDesc=$(this).find(".proShortDesc").html();$.getJSON("/products/"+productHandle+".js",function(product){product.available?$this.firstAvailableVariant(product.variants,$this):$this.currentVariant=product.variants[0],$this.buildQuickView(product,shortProductDesc),$this.createImageCarousel(),$this.renderReview(),$this.show()})}),$(selectors.body).on("click",selectors.quickViewClose,function(e){e.preventDefault(),$this.hide()}),$(selectors.quickViewContainer).on("change",selectors.quickviewVariant,function(e){$this.onVariantChange()})},firstAvailableVariant:function(variants,global){global.productVariants=variants;for(var i=0;i<variants.length;i++){var variant=variants[i];if(variant.available){global.currentVariant=variant;break}}},buildQuickView:function(product,shortProductDesc){var moneyFormat=vela.strings.moneyFormat,currentVariant=this.currentVariant,source=$(selectors.quickViewTemplate).html(),template=Handlebars.compile(source),images="",price="",tags="",shortDescription=shortProductDesc,qvObject={id:product.id};if(product.media.length>0){images+='<div class="quickview-images__list slick-carousel mx-0" data-quickview-images>';for(var i=0;i<product.media.length;i++){var media=product.media[i];media.media_type==="image"&&(images+='<div class="slick-carousel__item px-0"><div class="quickview-images__item" data-media-id='+media.id+'><img class="img-fluid" alt="'+product.title+'" src="'+media.src+'" /></div></div>')}images+="</div>"}qvObject.variantID=currentVariant.id,qvObject.sku=currentVariant.sku!==null&&currentVariant.sku!==""?currentVariant.sku:"N/A",qvObject.images=images,qvObject.title=product.title,qvObject.url=product.url,price+='<div class="price-container d-flex align-items-center">';var productCompareClass=product.compare_at_price>product.price?"":"d-none";if(price+='<div class="js-qv-product-price product-single__price">'+vela.Currency.formatMoney(product.price,moneyFormat)+"</div>",price+='<div class="js-qv-product-price-compare product-single__price--compare-at '+productCompareClass+'">'+vela.Currency.formatMoney(product.compare_at_price,moneyFormat)+"</div>",price+="</div>",qvObject.price=price,qvObject.shortDescription=shortDescription,qvObject.vendor='<a href="/collections/vendors?q='+product.type+'" title="'+product.type+'">'+product.vendor+"</a>",qvObject.type='<a href="/collections/types?q='+product.type+'" title="'+product.type+'">'+product.type+"</a>",product.tags.length>0)for(var tag_lenght=product.tags.length>2?2:product.tags.length,i=0;i<tag_lenght;i++)i!=0&&(tags+=",&nbsp;"),tags+='<a href="/collections/all/'+product.tags[i]+'" title="'+product.tags[i]+'">'+product.tags[i]+"</a>";qvObject.tags=tags,qvObject.variants=this.buildVariant(product),$(selectors.quickViewContainer).html(template(qvObject)),this.updateMedia(currentVariant),this.updateSKU(currentVariant),this.updateProductAvaiable(currentVariant),this.updateDetailsLink(currentVariant),this.updateToolTip(),this.qvAddToCart()},convertToSlug:function(str){return str.toLowerCase().replace(/[^a-z0-9 -]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-")},resizeImage:function(m,j){if(j==null)return m;if(j=="master")return m.replace(/http(s)?:/,"");var i=m.match(/\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?v=\d+)?/i);if(i!=null){var k=m.split(i[0]),l=i[0];return(k[0]+"_"+j+l).replace(/http(s)?:/,"")}else return null},buildVariant:function(product){var result="",currentVariant=this.currentVariant;if(product.options[0].name!=="Title")for(var options=product.options,i=0;i<options.length;i++){var option=options[i],optionIndex=i+1;if(result+='<div class="variants-wrapper product-form__item" data-quickview-variant-option="'+optionIndex+'">',result+='<label class="variants__label">'+option.name+"</label>",result+='<div class="variants__options">',vela.settings.quickViewVariantType==="select"){result+='<select class="js-quickview-option-selector product-form__input form-select" data-id="quickViewOptionSelector-'+optionIndex+'" data-index="option'+optionIndex+'">';for(var j=0;j<option.values.length;j++){var value=option.values[j];result+='<option value="'+_.escape(value)+'" ',result+=currentVariant.options[i]===value?'selected="selected"':"",result+=">"+value+"</option>"}result+="</select>"}else if(vela.settings.quickViewVariantType==="radio")for(var j=0;j<option.values.length;j++){for(var value=option.values[j],isDisable=!0,colorAttribute="",k=0;k<this.productVariants.length;k++){var variantCondition=this.productVariants[k];if(variantCondition.available){if(i==0&&variantCondition.option1===value){isDisable=!1;break}else if(i==1&&variantCondition.option2===value&&variantCondition.option1==currentVariant.option1){isDisable=!1;break}else if(i==2&&variantCondition.option3===value&&variantCondition.option2==currentVariant.option2&&variantCondition.option1==currentVariant.option1){isDisable=!1;break}}}if(vela.settings.quickViewColorSwatch&&colorLabel.toLowerCase().indexOf(option.name.toLowerCase())!=-1){var colorName=this.convertToSlug(value),colorName1=value.replace(/\s/g,""),colorImageUrl=vela.settings.fileURL+colorName+".png";if(vela.settings.quickViewColorSwatch)for(var k=0;k<this.productVariants.length;k++){var variantCondition=this.productVariants[k];if(variantCondition.available){for(var t=0;t<variantCondition.options.length;t++){var image_color="",option_name=this.convertToSlug(variantCondition.options[t]);if(option_name==colorName&&variantCondition.featured_image){image_color=variantCondition.featured_image.src;break}}if(image_color!=""&&vela.settings.quickViewImageSwatch){colorImageUrl=this.resizeImage(image_color,"small");break}}}colorAttribute='data-color="'+colorName+'" ',colorAttribute+='data-qv-toggle="tooltip" title="'+value+'"',colorAttribute+='style="background-color: '+colorName1+";background-image: url("+colorImageUrl+')"'}result+='<div class="single-option-selector">',result+='<input type="radio" data-single-option-button',result+=currentVariant.options[i]===value?" checked ":" ",isDisable&&(result+='disabled="disabled"'),result+='value="'+_.escape(value)+'" data-index="option'+optionIndex+'" name="option'+option.position+'" ',result+='class="js-quickview-option-selector',isDisable&&(result+=" disabled"),result+='" id="quickview-product-option-'+i+"-"+value.toLowerCase()+'">',result+='<label for="quickview-product-option-'+i+"-"+value.toLowerCase()+'" '+colorAttribute,isDisable&&(result+=' class="disabled"'),result+=">"+value+'<span class="d-none"></span></label>',result+="</div>"}result+="</div>",result+="</div>"}return result},createImageCarousel:function(){$(selectors.quickView).find(selectors.quickViewImages).slick({infinite:!1,rows:0})},renderReview:function(){if(window.SPR&&vela.settings.enableReview&&$(selectors.quickView).find(selectors.quickViewReview).length)return window.SPR.registerCallbacks(),window.SPR.initRatingHandler(),window.SPR.initDomEls(),window.SPR.loadProducts(),window.SPR.loadBadges()},qvAddToCart:function(){vela.settings.cartType!="page"&&ajaxCart.init({formSelector:".formQuickview",cartContainer:"[data-cart-container]",addToCartSelector:'button[type="submit"]',cartCountSelector:"[data-cart-count]",cartCostSelector:"[data-cart-cost]",moneyFormat:vela.strings.moneyFormat})},getCurrentOptions:function(){var currentOptions=_.map($(selectors.quickviewVariant,selectors.quickViewContainer),function(element){var $element=$(element),type=$element.attr("type"),currentOption={};return type==="radio"||type==="checkbox"?$element[0].checked?(currentOption.value=$element.val(),currentOption.index=$element.data("index"),currentOption):!1:(currentOption.value=$element.val(),currentOption.index=$element.data("index"),currentOption)});return currentOptions=_.compact(currentOptions),currentOptions},getVariantFromOptions:function(){var selectedValues=this.getCurrentOptions(),variants=this.productVariants,found=_.find(variants,function(variant){return selectedValues.every(function(values){return _.isEqual(variant[values.index],values.value)})});return found},updateVariantsButton:function(){for(var selectedValues=this.getCurrentOptions(),variants=this.productVariants,i=2;i<=3;i++)$('[data-quickview-variant-option="'+i+'"]',selectors.quickViewContainer).length&&$('[data-quickview-variant-option="'+i+'"] '+selectors.quickviewVariant,selectors.quickViewContainer).each(function(){var $self=$(this),optionValue=$self.val(),foundIndex;i===2?foundIndex=_.findIndex(variants,function(variant){return variant.option1===selectedValues[0].value&&variant.option2===optionValue&&variant.available===!0}):i===3&&(foundIndex=_.findIndex(variants,function(variant){return variant.option1===selectedValues[0].value&&variant.option2===selectedValues[1].value&&variant.option3===optionValue&&variant.available===!0})),foundIndex!==-1?($self.removeAttr("disabled","disabled").removeClass("disabled"),$self.next("label").removeClass("disabled")):($self.attr("disabled","disabled").addClass("disabled"),$self.next("label").addClass("disabled"))})},updateVariantsButtonDisabed:function(){for(var i=2;i<=3;i++)if($('[data-quickview-variant-option="'+i+'"]',selectors.quickViewContainer).length){var isUpdate=!1;$('[data-quickview-variant-option="'+i+'"] '+selectors.quickviewVariant,selectors.quickViewContainer).each(function(){var $element=$(this),type=$element.attr("type");if((type==="radio"||type==="checkbox")&&this.checked&&$element.hasClass("disabled"))return $element.prop("checked",!1),isUpdate=!0,!1}),$('[data-quickview-variant-option="'+i+'"] '+selectors.quickviewVariant,selectors.quickViewContainer).each(function(){var $element=$(this),type=$element.attr("type");if(isUpdate&&(type==="radio"||type==="checkbox")&&!$element.hasClass("disabled"))return $element.prop("checked",!0),isUpdate=!1,$element.trigger("change"),!1})}},updateMasterSelect:function(variant){variant&&$(selectors.originalSelectorId,selectors.quickViewContainer).val(variant.id)},updateMedia:function(variant){variant&&variant.featured_media&&variant.featured_media.id&&$(selectors.quickViewImages,selectors.quickViewContainer).find(".quickview-images__item").each(function(){var imageID=$(this).data("media-id");if(variant.featured_media.id==imageID){var slickIndex=$(this).closest(".slick-carousel__item").data("slick-index");slickIndex!=null&&$(selectors.quickViewImages,selectors.quickViewContainer).slick("slickGoTo",slickIndex)}})},updatePrice:function(variant){var moneyFormat=vela.strings.moneyFormat;variant?($(selectors.quickViewProductPrice,selectors.quickViewContainer).removeClass("d-none"),$(selectors.quickViewProductPriceCompare,selectors.quickViewContainer).removeClass("d-none"),$(selectors.quickViewProductPrice,selectors.quickViewContainer).html(vela.Currency.formatMoney(variant.price,moneyFormat)),variant.compare_at_price>variant.price?($(selectors.quickViewProductPriceCompare,selectors.quickViewContainer).html(vela.Currency.formatMoney(variant.compare_at_price,moneyFormat)).removeClass("d-none"),$(selectors.quickViewProductPrice,selectors.quickViewContainer).addClass("on-sale")):($(selectors.quickViewProductPriceCompare,selectors.quickViewContainer).addClass("d-none"),$(selectors.quickViewProductPrice,selectors.quickViewContainer).removeClass("on-sale"))):($(selectors.quickViewProductPrice,selectors.quickViewContainer).addClass("d-none"),$(selectors.quickViewProductPriceCompare,selectors.quickViewContainer).addClass("d-none"))},updateSKU:function(variant){var sku=variant&&variant.sku!==null&&variant.sku!==""?variant.sku:"N/A";$(selectors.quickViewSKU,selectors.quickViewContainer).html(sku)},updateProductAvaiable:function(variant){var classActive="product-avaiable--active",translations=vela.strings;$(selectors.quickViewAvaiable,selectors.quickViewContainer).removeClass(classActive),preOrder&&$(selectors.quickViewAvaiableInStockText,selectors.quickViewContainer).addClass("text-info").html(translations.preOrder),variant?(variant.available?($(selectors.quickViewQty,selectors.quickViewContainer).removeClass("d-none"),$(selectors.quickViewAvaiableInStock,selectors.quickViewContainer).addClass(classActive)):($(selectors.quickViewQty,selectors.quickViewContainer).addClass("d-none"),$(selectors.quickViewAvaiableOutStock,selectors.quickViewContainer).addClass(classActive)),variant.available?($(selectors.quickViewContainer).find(".btn--add-to-cart").removeClass("disabled").prop("disabled",!1),preOrder?$(selectors.quickViewContainer).find(".btn--add-to-cart .btn__text").html(translations.preOrder):$(selectors.quickViewContainer).find(".btn--add-to-cart .btn__text").html(translations.addToCart)):($(selectors.quickViewContainer).find(".btn--add-to-cart").addClass("disabled").prop("disabled",!0),$(selectors.quickViewContainer).find(".btn--add-to-cart .btn__text").html(translations.soldOut))):($(selectors.quickViewQty,selectors.quickViewContainer).addClass("d-none"),$(selectors.quickViewContainer).find(".btn--add-to-cart").addClass("disabled").prop("disabled",!0),$(selectors.quickViewContainer).find(".btn--add-to-cart .btn__text").html(translations.unavailable))},updateDetailsLink:function(variant){if(variant){var productURL=$(selectors.quickViewProductDetailsURL,selectors.quickViewContainer).data("url")+"?variant="+variant.id;$(selectors.quickViewProductDetailsURL,selectors.quickViewContainer).removeClass("d-none").attr("href",productURL)}else $(selectors.quickViewProductDetailsURL,selectors.quickViewContainer).addClass("d-none")},updateToolTip:function(){$('[data-qv-toggle="tooltip"]',selectors.quickViewContainer).tooltip()},onVariantChange:function(){var variant=this.getVariantFromOptions();if($("[data-single-option-button]",selectors.quickViewContainer).length&&(this.updateVariantsButton(),!variant||!variant.available)){this.updateVariantsButtonDisabed();return}this.updateMasterSelect(variant),this.updateMedia(variant),this.updatePrice(variant),this.updateSKU(variant),this.updateProductAvaiable(variant),this.updateDetailsLink(variant),this.currentVariant=variant},show:function(){$(selectors.body).addClass("quickview-active"),$(selectors.quickView).addClass("show")},hide:function(){$(selectors.quickViewContainer).html(),$(selectors.body).removeClass("quickview-active"),$(selectors.quickView).removeClass("show")}}),QuickView}();
//# sourceMappingURL=/cdn/shop/t/56/assets/quickview.js.map?v=92902715451048540481705141258
