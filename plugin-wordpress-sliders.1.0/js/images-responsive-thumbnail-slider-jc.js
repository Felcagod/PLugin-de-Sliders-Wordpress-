

;(function($) {

  var defaults = {

   
    mode: 'horizontal',
    slideSelector: '',
    infiniteLoop: true,
    hideControlOnEnd: false,
    speed: 500,
    easing: null,
    slideMargin: 0,
    startSlide: 0,
    randomStart: false,
    captions: false,
    ticker: false,
    tickerHover: false,
    adaptiveHeight: false,
    adaptiveHeightSpeed: 500,
    video: false,
    useCSS: true,
    preloadImages: 'visible',
    responsive: true,
    slideZIndex: 50,
    wrapperClass: 'bx-wrapper',

    
    touchEnabled: true,
    swipeThreshold: 50,
    oneToOneTouch: true,
    preventDefaultSwipeX: true,
    preventDefaultSwipeY: false,

    
    ariaLive: true,
    ariaHidden: true,

    keyboardEnabled: false,

    
    pager: true,
    pagerType: 'full',
    pagerShortSeparator: ' / ',
    pagerSelector: null,
    buildPager: null,
    pagerCustom: null,

    
    controls: true,
    nextText: 'Next',
    prevText: 'Prev',
    nextSelector: null,
    prevSelector: null,
    autoControls: false,
    startText: 'Start',
    stopText: 'Stop',
    autoControlsCombine: false,
    autoControlsSelector: null,

    
    auto: false,
    pause: 4000,
    autoStart: true,
    autoDirection: 'next',
    stopAutoOnClick: false,
    autoHover: false,
    autoDelay: 0,
    autoSlideForOnePage: false,

    
    minSlides: 1,
    maxSlides: 1,
    moveSlides: 0,
    slideWidth: 0,
    shrinkItems: false,

    
    onSliderLoad: function() { return true; },
    onSlideBefore: function() { return true; },
    onSlideAfter: function() { return true; },
    onSlideNext: function() { return true; },
    onSlidePrev: function() { return true; },
    onSliderResize: function() { return true; }
  };

  $.fn.bxSlider = function(options) {

    if (this.length === 0) {
      return this;
    }

    
    if (this.length > 1) {
      this.each(function() {
        $(this).bxSlider(options);
      });
      return this;
    }

    
    var slider = {},
    
    el = this,
    
    windowWidth = $(window).width(),
    windowHeight = $(window).height();

    
    if ($(el).data('bxSlider')) { return; }

   
    var init = function() {
      
      if ($(el).data('bxSlider')) { return; }
      
      slider.settings = $.extend({}, defaults, options);
     
      slider.settings.slideWidth = parseInt(slider.settings.slideWidth);
      
      slider.children = el.children(slider.settings.slideSelector);
    
      if (slider.children.length < slider.settings.minSlides) { slider.settings.minSlides = slider.children.length; }
      if (slider.children.length < slider.settings.maxSlides) { slider.settings.maxSlides = slider.children.length; }
    
      if (slider.settings.randomStart) { slider.settings.startSlide = Math.floor(Math.random() * slider.children.length); }
     
      slider.active = { index: slider.settings.startSlide };
      
      slider.carousel = slider.settings.minSlides > 1 || slider.settings.maxSlides > 1 ? true : false;
     
      if (slider.carousel) { slider.settings.preloadImages = 'all'; }
      
      slider.minThreshold = (slider.settings.minSlides * slider.settings.slideWidth) + ((slider.settings.minSlides - 1) * slider.settings.slideMargin);
      slider.maxThreshold = (slider.settings.maxSlides * slider.settings.slideWidth) + ((slider.settings.maxSlides - 1) * slider.settings.slideMargin);
     
      slider.working = false;
    
      slider.controls = {};
     
      slider.interval = null;
      
      slider.animProp = slider.settings.mode === 'vertical' ? 'top' : 'left';
     
      slider.usingCSS = slider.settings.useCSS && slider.settings.mode !== 'fade' && (function() {
        
        var div = document.createElement('div'),
        
        props = ['WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective'];
        
        for (var i = 0; i < props.length; i++) {
          if (div.style[props[i]] !== undefined) {
            slider.cssPrefix = props[i].replace('Perspective', '').toLowerCase();
            slider.animProp = '-' + slider.cssPrefix + '-transform';
            return true;
          }
        }
        return false;
      }());
      
      if (slider.settings.mode === 'vertical') { slider.settings.maxSlides = slider.settings.minSlides; }
      
      el.data('origStyle', el.attr('style'));
      el.children(slider.settings.slideSelector).each(function() {
        $(this).data('origStyle', $(this).attr('style'));
        
           if($(this).find('img').length >0){
                
                $(this).find('img').each(function(index, elm) {
                    
                    
                    var toload='';
                    var toloadval='';
                    $.each(elm.attributes, function(i, attrib){

                        var value = attrib.value;
                        var aname=attrib.name;

                        var pattern = /^((http|https):\/\/)/;

                        if(pattern.test(value) && aname!='src' && aname.indexOf('data-html5_vurl')==-1) {

                            toload=aname;
                            toloadval=value;
                            }
                        
                    });

                                
                    vsrc=$(elm).attr("src");
                    $(elm).removeAttr("src");
                    dsrc=$(elm).attr("data-src");
                    lsrc=$(elm).attr("data-lazy-src");
                    
                    if(dsrc!== undefined && dsrc!='' && dsrc!=vsrc){
                            $(elm).attr("src",dsrc);
                        }
                    else if(lsrc!== undefined && lsrc!=vsrc){
                        
                        $(elm).attr("src",lsrc);
                    }
                     else if(toload!='' && toload!='srcset' && toloadval!='' && toloadval!=vsrc){

                        $(elm).attr("src",toloadval);


                    } 
                    else{
                        
                        $(elm).attr("src",vsrc);
                        
                    }   
                    
                    elm=$(elm)[0];      
                    if(!elm.complete && elm.naturalHeight == 0){
                        
                        $(elm).removeAttr('loading');
                        $(elm).removeAttr('data-lazy-type');
                        
                        
                        $(elm).removeClass('lazy');
                        
                        $(elm).removeClass('lazyLoad');
                        $(elm).removeClass('lazy-loaded');
                        $(elm).removeClass('jetpack-lazy-image');
                        $(elm).removeClass('jetpack-lazy-image--handled');
                        $(elm).removeClass('lazy-hidden');
                
                }
                    
                });    
                    
            }
      });

     
      setup();
    };

    
    var setup = function() {
      var preloadSelector = slider.children.eq(slider.settings.startSlide); 

     
      el.wrap('<div class="' + slider.settings.wrapperClass + '"><div class="bx-viewport"></div></div>');
     
      slider.viewport = el.parent();

     
      if (slider.settings.ariaLive && !slider.settings.ticker) {
        slider.viewport.attr('aria-live', 'polite');
      }
    
      slider.loader = $('<div class="bx-loading" />');
      slider.viewport.prepend(slider.loader);
      
      el.css({
        width: slider.settings.mode === 'horizontal' ? (slider.children.length * 1000 + 215) + '%' : 'auto',
        position: 'relative'
      });
      
      if (slider.usingCSS && slider.settings.easing) {
        el.css('-' + slider.cssPrefix + '-transition-timing-function', slider.settings.easing);
      
        slider.settings.easing = 'swing';
      }
      
      slider.viewport.css({
        width: '100%',
        overflow: 'hidden',
        position: 'relative'
      });
      slider.viewport.parent().css({
        maxWidth: getViewportMaxWidth()
      });
      
      if (!slider.settings.pager && !slider.settings.controls) {
        slider.viewport.parent().css({
          margin: '0 auto 0px'
        });
      }
      
      slider.children.css({
        float: slider.settings.mode === 'horizontal' ? 'left' : 'none',
        listStyle: 'none',
        position: 'relative'
      });
     
      slider.children.css('width', getSlideWidth());
      
      if (slider.settings.mode === 'horizontal' && slider.settings.slideMargin > 0) { slider.children.css('marginRight', slider.settings.slideMargin); }
      if (slider.settings.mode === 'vertical' && slider.settings.slideMargin > 0) { slider.children.css('marginBottom', slider.settings.slideMargin); }
      
      if (slider.settings.mode === 'fade') {
        slider.children.css({
          position: 'absolute',
          zIndex: 0,
          display: 'none'
        });
        
        slider.children.eq(slider.settings.startSlide).css({zIndex: slider.settings.slideZIndex, display: 'block'});
      }
      
      slider.controls.el = $('<div class="bx-controls" />');
     
      if (slider.settings.captions) { appendCaptions(); }
   
      slider.active.last = slider.settings.startSlide === getPagerQty() - 1;
    
      if (slider.settings.video) { el.fitVids(); }
      if (slider.settings.preloadImages === 'all' || slider.settings.ticker) { preloadSelector = slider.children; }
    
      if (!slider.settings.ticker) {
    
        if (slider.settings.controls) { appendControls(); }
      
        if (slider.settings.auto && slider.settings.autoControls) { appendControlsAuto(); }
      
        if (slider.settings.pager) { appendPager(); }
     
        if (slider.settings.controls || slider.settings.autoControls || slider.settings.pager) { slider.viewport.after(slider.controls.el); }
    
      } else {
        slider.settings.pager = false;
      }
      loadElements(preloadSelector, start);
    };

    var loadElements = function(selector, callback) {
      var total = selector.find('img:not([src=""]), iframe').length,
      count = 0;
      if (total === 0) {
        callback();
        return;
      }
      selector.find('img:not([src=""]), iframe').each(function() {
        $(this).one('load error', function() {
          if (++count === total) { callback(); }
        }).each(function() {
          if (this.complete) { $(this).trigger( "load" ) }
        });
      });
    };


    var start = function() {
      
      if (slider.settings.infiniteLoop && slider.settings.mode !== 'fade' && !slider.settings.ticker) {
        var slice    = slider.settings.mode === 'vertical' ? slider.settings.minSlides : slider.settings.maxSlides,
        sliceAppend  = slider.children.slice(0, slice).clone(true).addClass('bx-clone'),
        slicePrepend = slider.children.slice(-slice).clone(true).addClass('bx-clone');
        if (slider.settings.ariaHidden) {
          sliceAppend.attr('aria-hidden', true);
          slicePrepend.attr('aria-hidden', true);
        }
        el.append(sliceAppend).prepend(slicePrepend);
      }

      slider.loader.remove();

      setSlidePosition();

      if (slider.settings.mode === 'vertical') { slider.settings.adaptiveHeight = true; }

      slider.viewport.height(getViewportHeight());

      el.redrawSlider();

      slider.settings.onSliderLoad.call(el, slider.active.index);

      slider.initialized = true;

      if (slider.settings.responsive) { $(window).bind('resize', resizeWindow); }

      if (slider.settings.auto && slider.settings.autoStart && (getPagerQty() > 1 || slider.settings.autoSlideForOnePage)) { initAuto(); }

      if (slider.settings.ticker) { initTicker(); }

      if (slider.settings.pager) { updatePagerActive(slider.settings.startSlide); }

      if (slider.settings.controls) { updateDirectionControls(); }

      if (slider.settings.touchEnabled && !slider.settings.ticker) { initTouch(); }

      if (slider.settings.keyboardEnabled && !slider.settings.ticker) {
        $(document).keydown(keyPress);
      }
    };

   
    var getViewportHeight = function() {
      var height = el.outerHeight(),
      currentIndex = null,

      children = $();

      if (slider.settings.mode !== 'vertical' && !slider.settings.adaptiveHeight) {

        children = slider.children;
      } else {

        if (!slider.carousel) {
          children = slider.children.eq(slider.active.index);

        } else {

          currentIndex = slider.settings.moveSlides === 1 ? slider.active.index : slider.active.index * getMoveBy();

          children = slider.children.eq(currentIndex);

          for (var i = 1; i <= slider.settings.maxSlides - 1; i++) {

            if (currentIndex + i >= slider.children.length) {
              children = children.add(slider.children.eq(currentIndex + i - slider.children.length));
            } else {
              children = children.add(slider.children.eq(currentIndex + i));
            }
          }
        }
      }

      if (slider.settings.mode === 'vertical') {
        children.each(function(index) {
          height += $(this).outerHeight();
        });


        if (slider.settings.slideMargin > 0) {
          height += slider.settings.slideMargin * (slider.settings.minSlides - 1);
        }

      } else {

        height = Math.max.apply(Math, children.map(function() {
          return $(this).outerHeight(false);
        }).get());
      }

      if (slider.viewport.css('box-sizing') === 'border-box') {
        height += parseFloat(slider.viewport.css('padding-top')) + parseFloat(slider.viewport.css('padding-bottom')) +
              parseFloat(slider.viewport.css('border-top-width')) + parseFloat(slider.viewport.css('border-bottom-width'));
      } else if (slider.viewport.css('box-sizing') === 'padding-box') {
        height += parseFloat(slider.viewport.css('padding-top')) + parseFloat(slider.viewport.css('padding-bottom'));
      }


      return height;
    };


    var getViewportMaxWidth = function() {
      var width = '100%';
      if (slider.settings.slideWidth > 0) {
        if (slider.settings.mode === 'horizontal') {
          width = (slider.settings.maxSlides * slider.settings.slideWidth) + ((slider.settings.maxSlides - 1) * slider.settings.slideMargin);
        } else {
          width = slider.settings.slideWidth;
        }
      }
      return width;
    };

  
    var getSlideWidth = function() {
      var newElWidth = slider.settings.slideWidth, 
      wrapWidth      = slider.viewport.width();    

      if (slider.settings.slideWidth === 0 ||
        (slider.settings.slideWidth > wrapWidth && !slider.carousel) ||
        slider.settings.mode === 'vertical') {
        newElWidth = wrapWidth;
     
      } else if (slider.settings.maxSlides > 1 && slider.settings.mode === 'horizontal') {
        if (wrapWidth > slider.maxThreshold) {
          return newElWidth;
        } else if (wrapWidth < slider.minThreshold) {
          newElWidth = (wrapWidth - (slider.settings.slideMargin * (slider.settings.minSlides - 1))) / slider.settings.minSlides;
        } else if (slider.settings.shrinkItems) {
          newElWidth = Math.floor((wrapWidth + slider.settings.slideMargin) / (Math.ceil((wrapWidth + slider.settings.slideMargin) / (newElWidth + slider.settings.slideMargin))) - slider.settings.slideMargin);
        }
      }
      return newElWidth;
    };

  
    var getNumberSlidesShowing = function() {
      var slidesShowing = 1,
      childWidth = null;
      if (slider.settings.mode === 'horizontal' && slider.settings.slideWidth > 0) {
        
        if (slider.viewport.width() < slider.minThreshold) {
          slidesShowing = slider.settings.minSlides;
      
        } else if (slider.viewport.width() > slider.maxThreshold) {
          slidesShowing = slider.settings.maxSlides;
        
        } else {
          childWidth = slider.children.first().width() + slider.settings.slideMargin;
          slidesShowing = Math.floor((slider.viewport.width() +
            slider.settings.slideMargin) / childWidth);
        }
  
      } else if (slider.settings.mode === 'vertical') {
        slidesShowing = slider.settings.minSlides;
      }
      return slidesShowing;
    };

  
    var getPagerQty = function() {
      var pagerQty = 0,
      breakPoint = 0,
      counter = 0;
     
      if (slider.settings.moveSlides > 0) {
        if (slider.settings.infiniteLoop) {
          pagerQty = Math.ceil(slider.children.length / getMoveBy());
        } else {
         
          while (breakPoint < slider.children.length) {
            ++pagerQty;
            breakPoint = counter + getNumberSlidesShowing();
            counter += slider.settings.moveSlides <= getNumberSlidesShowing() ? slider.settings.moveSlides : getNumberSlidesShowing();
          }
        }
      
      } else {
        pagerQty = Math.ceil(slider.children.length / getNumberSlidesShowing());
      }
      return pagerQty;
    };

   
    var getMoveBy = function() {
     
      if (slider.settings.moveSlides > 0 && slider.settings.moveSlides <= getNumberSlidesShowing()) {
        return slider.settings.moveSlides;
      }

      return getNumberSlidesShowing();
    };

   
    var setSlidePosition = function() {
      var position, lastChild, lastShowingIndex;
      
      if (slider.children.length > slider.settings.maxSlides && slider.active.last && !slider.settings.infiniteLoop) {
        if (slider.settings.mode === 'horizontal') {
         
          lastChild = slider.children.last();
          position = lastChild.position();
         
          setPositionProperty(-(position.left - (slider.viewport.width() - lastChild.outerWidth())), 'reset', 0);
        } else if (slider.settings.mode === 'vertical') {
          
          lastShowingIndex = slider.children.length - slider.settings.minSlides;
          position = slider.children.eq(lastShowingIndex).position();
          
          setPositionProperty(-position.top, 'reset', 0);
        }
     
      } else {
        
        position = slider.children.eq(slider.active.index * getMoveBy()).position();
        
        if (slider.active.index === getPagerQty() - 1) { slider.active.last = true; }
       
        if (position !== undefined) {
          if (slider.settings.mode === 'horizontal') { setPositionProperty(-position.left, 'reset', 0); }
          else if (slider.settings.mode === 'vertical') { setPositionProperty(-position.top, 'reset', 0); }
        }
      }
    };

    /**
     * 
     *
     * @param value 
     * 
     *
     * @param type 
     *
     * @param duration 
     *
     * @param params 
     */
    var setPositionProperty = function(value, type, duration, params) {
      var animateObj, propValue;
      
      if (slider.usingCSS) {
       
        propValue = slider.settings.mode === 'vertical' ? 'translate3d(0, ' + value + 'px, 0)' : 'translate3d(' + value + 'px, 0, 0)';
        
        el.css('-' + slider.cssPrefix + '-transition-duration', duration / 1000 + 's');
        if (type === 'slide') {
          
          el.css(slider.animProp, propValue);
         
          el.bind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function(e) {
            
            if (!$(e.target).is(el)) { return; }
           
            el.unbind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd');
            updateAfterSlideTransition();
          });
        } else if (type === 'reset') {
          el.css(slider.animProp, propValue);
        } else if (type === 'ticker') {
         
          el.css('-' + slider.cssPrefix + '-transition-timing-function', 'linear');
          el.css(slider.animProp, propValue);
          
          el.bind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function(e) {
            
            if (!$(e.target).is(el)) { return; }
          
            el.unbind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd');
           
            setPositionProperty(params.resetValue, 'reset', 0);
           
            tickerLoop();
          });
        }
    
      } else {
        animateObj = {};
        animateObj[slider.animProp] = value;
        if (type === 'slide') {
          el.animate(animateObj, duration, slider.settings.easing, function() {
            updateAfterSlideTransition();
          });
        } else if (type === 'reset') {
          el.css(slider.animProp, value);
        } else if (type === 'ticker') {
          el.animate(animateObj, duration, 'linear', function() {
            setPositionProperty(params.resetValue, 'reset', 0);
            
            tickerLoop();
          });
        }
      }
    };

   
    var populatePager = function() {
      var pagerHtml = '',
      linkContent = '',
      pagerQty = getPagerQty();
   
      for (var i = 0; i < pagerQty; i++) {
        linkContent = '';
        
        if (slider.settings.buildPager && $.isFunction(slider.settings.buildPager) || slider.settings.pagerCustom) {
          linkContent = slider.settings.buildPager(i);
          slider.pagerEl.addClass('bx-custom-pager');
        } else {
          linkContent = i + 1;
          slider.pagerEl.addClass('bx-default-pager');
        }
       
        pagerHtml += '<div class="bx-pager-item"><a href="" data-slide-index="' + i + '" class="bx-pager-link">' + linkContent + '</a></div>';
      }
      
      slider.pagerEl.html(pagerHtml);
    };

   
    var appendPager = function() {
      if (!slider.settings.pagerCustom) {
        
        slider.pagerEl = $('<div class="bx-pager" />');
        
        if (slider.settings.pagerSelector) {
          $(slider.settings.pagerSelector).html(slider.pagerEl);
       
        } else {
          slider.controls.el.addClass('bx-has-pager').append(slider.pagerEl);
        }
       
        populatePager();
      } else {
        slider.pagerEl = $(slider.settings.pagerCustom);
      }
  
      slider.pagerEl.on('click touchend', 'a', clickPagerBind);
    };

   
    var appendControls = function() {
      slider.controls.next = $('<a class="bx-next" href="">' + slider.settings.nextText + '</a>');
      slider.controls.prev = $('<a class="bx-prev" href="">' + slider.settings.prevText + '</a>');
      // bind click actions to the controls
      slider.controls.next.bind('click touchend', clickNextBind);
      slider.controls.prev.bind('click touchend', clickPrevBind);
      // if nextSelector was supplied, populate it
      if (slider.settings.nextSelector) {
        $(slider.settings.nextSelector).append(slider.controls.next);
      }
      // if prevSelector was supplied, populate it
      if (slider.settings.prevSelector) {
        $(slider.settings.prevSelector).append(slider.controls.prev);
      }
      // if no custom selectors were supplied
      if (!slider.settings.nextSelector && !slider.settings.prevSelector) {
        // add the controls to the DOM
        slider.controls.directionEl = $('<div class="bx-controls-direction" />');
        // add the control elements to the directionEl
        slider.controls.directionEl.append(slider.controls.prev).append(slider.controls.next);
        // slider.viewport.append(slider.controls.directionEl);
        slider.controls.el.addClass('bx-has-controls-direction').append(slider.controls.directionEl);
      }
    };

   
    var appendControlsAuto = function() {
      slider.controls.start = $('<div class="bx-controls-auto-item"><a class="bx-start" href="">' + slider.settings.startText + '</a></div>');
      slider.controls.stop = $('<div class="bx-controls-auto-item"><a class="bx-stop" href="">' + slider.settings.stopText + '</a></div>');
      // add the controls to the DOM
      slider.controls.autoEl = $('<div class="bx-controls-auto" />');
      // bind click actions to the controls
      slider.controls.autoEl.on('click', '.bx-start', clickStartBind);
      slider.controls.autoEl.on('click', '.bx-stop', clickStopBind);
      // if autoControlsCombine, insert only the "start" control
      if (slider.settings.autoControlsCombine) {
        slider.controls.autoEl.append(slider.controls.start);
      // if autoControlsCombine is false, insert both controls
      } else {
        slider.controls.autoEl.append(slider.controls.start).append(slider.controls.stop);
      }
      // if auto controls selector was supplied, populate it with the controls
      if (slider.settings.autoControlsSelector) {
        $(slider.settings.autoControlsSelector).html(slider.controls.autoEl);
      // if auto controls selector was not supplied, add it after the wrapper
      } else {
        slider.controls.el.addClass('bx-has-controls-auto').append(slider.controls.autoEl);
      }
      // update the auto controls
      updateAutoControls(slider.settings.autoStart ? 'stop' : 'start');
    };

    /**
     * Appends image captions to the DOM
     */
    var appendCaptions = function() {
      // cycle through each child
      slider.children.each(function(index) {
        // get the image title attribute
        var title = $(this).find('img:first').attr('title');
        // append the caption
        if (title !== undefined && ('' + title).length) {
          $(this).append('<div class="bx-caption"><span>' + title + '</span></div>');
        }
      });
    };

    /**
     * Click next binding
     *
     * @param e (event)
     *  - DOM event object
     */
    var clickNextBind = function(e) {
      e.preventDefault();
      if (slider.controls.el.hasClass('disabled')) { return; }
      // if auto show is running, stop it
      if (slider.settings.auto && slider.settings.stopAutoOnClick) { el.stopAuto(); }
      el.goToNextSlide();
    };

    /**
     * Click prev binding
     *
     * @param e (event)
     *  - DOM event object
     */
    var clickPrevBind = function(e) {
      e.preventDefault();
      if (slider.controls.el.hasClass('disabled')) { return; }
      // if auto show is running, stop it
      if (slider.settings.auto && slider.settings.stopAutoOnClick) { el.stopAuto(); }
      el.goToPrevSlide();
    };

    /**
     * Click start binding
     *
     * @param e (event)
     *  - DOM event object
     */
    var clickStartBind = function(e) {
      el.startAuto();
      e.preventDefault();
    };

    /**
     * Click stop binding
     *
     * @param e (event)
     *  - DOM event object
     */
    var clickStopBind = function(e) {
      el.stopAuto();
      e.preventDefault();
    };

    /**
     * Click pager binding
     *
     * @param e (event)
     *  - DOM event object
     */
    var clickPagerBind = function(e) {
      var pagerLink, pagerIndex;
      e.preventDefault();
      if (slider.controls.el.hasClass('disabled')) {
        return;
      }
      // if auto show is running, stop it
      if (slider.settings.auto  && slider.settings.stopAutoOnClick) { el.stopAuto(); }
      pagerLink = $(e.currentTarget);
      if (pagerLink.attr('data-slide-index') !== undefined) {
        pagerIndex = parseInt(pagerLink.attr('data-slide-index'));
        // if clicked pager link is not active, continue with the goToSlide call
        if (pagerIndex !== slider.active.index) { el.goToSlide(pagerIndex); }
      }
    };

    /**
     * Updates the pager links with an active class
     *
     * @param slideIndex (int)
     *  - index of slide to make active
     */
    var updatePagerActive = function(slideIndex) {
      // if "short" pager type
      var len = slider.children.length; // nb of children
      if (slider.settings.pagerType === 'short') {
        if (slider.settings.maxSlides > 1) {
          len = Math.ceil(slider.children.length / slider.settings.maxSlides);
        }
        slider.pagerEl.html((slideIndex + 1) + slider.settings.pagerShortSeparator + len);
        return;
      }
      // remove all pager active classes
      slider.pagerEl.find('a').removeClass('active');
      // apply the active class for all pagers
      slider.pagerEl.each(function(i, el) { $(el).find('a').eq(slideIndex).addClass('active'); });
    };

    /**
     * Performs needed actions after a slide transition
     */
    var updateAfterSlideTransition = function() {
      // if infinite loop is true
      if (slider.settings.infiniteLoop) {
        var position = '';
        // first slide
        if (slider.active.index === 0) {
          // set the new position
          position = slider.children.eq(0).position();
        // carousel, last slide
        } else if (slider.active.index === getPagerQty() - 1 && slider.carousel) {
          position = slider.children.eq((getPagerQty() - 1) * getMoveBy()).position();
        // last slide
        } else if (slider.active.index === slider.children.length - 1) {
          position = slider.children.eq(slider.children.length - 1).position();
        }
        if (position) {
          if (slider.settings.mode === 'horizontal') { setPositionProperty(-position.left, 'reset', 0); }
          else if (slider.settings.mode === 'vertical') { setPositionProperty(-position.top, 'reset', 0); }
        }
      }
      // declare that the transition is complete
      slider.working = false;
      // onSlideAfter callback
      slider.settings.onSlideAfter.call(el, slider.children.eq(slider.active.index), slider.oldIndex, slider.active.index);
    };

    /**
     * Updates the auto controls state (either active, or combined switch)
     *
     * @param state (string) "start", "stop"
     *  - the new state of the auto show
     */
    var updateAutoControls = function(state) {
      // if autoControlsCombine is true, replace the current control with the new state
      if (slider.settings.autoControlsCombine) {
        slider.controls.autoEl.html(slider.controls[state]);
      // if autoControlsCombine is false, apply the "active" class to the appropriate control
      } else {
        slider.controls.autoEl.find('a').removeClass('active');
        slider.controls.autoEl.find('a:not(.bx-' + state + ')').addClass('active');
      }
    };

    /**
     * Updates the direction controls (checks if either should be hidden)
     */
    var updateDirectionControls = function() {
      if (getPagerQty() === 1) {
        slider.controls.prev.addClass('disabled');
        slider.controls.next.addClass('disabled');
      } else if (!slider.settings.infiniteLoop && slider.settings.hideControlOnEnd) {
        // if first slide
        if (slider.active.index === 0) {
          slider.controls.prev.addClass('disabled');
          slider.controls.next.removeClass('disabled');
        // if last slide
        } else if (slider.active.index === getPagerQty() - 1) {
          slider.controls.next.addClass('disabled');
          slider.controls.prev.removeClass('disabled');
        // if any slide in the middle
        } else {
          slider.controls.prev.removeClass('disabled');
          slider.controls.next.removeClass('disabled');
        }
      }
    };

    /**
     * Initializes the auto process
     */
    var initAuto = function() {
      // if autoDelay was supplied, launch the auto show using a setTimeout() call
      if (slider.settings.autoDelay > 0) {
        var timeout = setTimeout(el.startAuto, slider.settings.autoDelay);
      // if autoDelay was not supplied, start the auto show normally
      } else {
        el.startAuto();

        //add focus and blur events to ensure its running if timeout gets paused
        $(window).focus(function() {
          el.startAuto();
        }).blur(function() {
          el.stopAuto();
        });
      }
      // if autoHover is requested
      if (slider.settings.autoHover) {
        // on el hover
        el.hover(function() {
          // if the auto show is currently playing (has an active interval)
          if (slider.interval) {
            // stop the auto show and pass true argument which will prevent control update
            el.stopAuto(true);
            // create a new autoPaused value which will be used by the relative "mouseout" event
            slider.autoPaused = true;
          }
        }, function() {
          // if the autoPaused value was created be the prior "mouseover" event
          if (slider.autoPaused) {
            // start the auto show and pass true argument which will prevent control update
            el.startAuto(true);
            // reset the autoPaused value
            slider.autoPaused = null;
          }
        });
      }
    };

    /**
     * Initializes the ticker process
     */
    var initTicker = function() {
      var startPosition = 0,
      position, transform, value, idx, ratio, property, newSpeed, totalDimens;
      // if autoDirection is "next", append a clone of the entire slider
      if (slider.settings.autoDirection === 'next') {
        el.append(slider.children.clone().addClass('bx-clone'));
      // if autoDirection is "prev", prepend a clone of the entire slider, and set the left position
      } else {
        el.prepend(slider.children.clone().addClass('bx-clone'));
        position = slider.children.first().position();
        startPosition = slider.settings.mode === 'horizontal' ? -position.left : -position.top;
      }
      setPositionProperty(startPosition, 'reset', 0);
      // do not allow controls in ticker mode
      slider.settings.pager = false;
      slider.settings.controls = false;
      slider.settings.autoControls = false;
      // if autoHover is requested
      if (slider.settings.tickerHover) {
        if (slider.usingCSS) {
          idx = slider.settings.mode === 'horizontal' ? 4 : 5;
          slider.viewport.hover(function() {
            transform = el.css('-' + slider.cssPrefix + '-transform');
            value = parseFloat(transform.split(',')[idx]);
            setPositionProperty(value, 'reset', 0);
          }, function() {
            totalDimens = 0;
            slider.children.each(function(index) {
              totalDimens += slider.settings.mode === 'horizontal' ? $(this).outerWidth(true) : $(this).outerHeight(true);
            });
            // calculate the speed ratio (used to determine the new speed to finish the paused animation)
            ratio = slider.settings.speed / totalDimens;
            // determine which property to use
            property = slider.settings.mode === 'horizontal' ? 'left' : 'top';
            // calculate the new speed
            newSpeed = ratio * (totalDimens - (Math.abs(parseInt(value))));
            tickerLoop(newSpeed);
          });
        } else {
          // on el hover
          slider.viewport.hover(function() {
            el.stop(true);
          }, function() {
            // calculate the total width of children (used to calculate the speed ratio)
            totalDimens = 0;
            slider.children.each(function(index) {
              totalDimens += slider.settings.mode === 'horizontal' ? $(this).outerWidth(true) : $(this).outerHeight(true);
            });
            // calculate the speed ratio (used to determine the new speed to finish the paused animation)
            ratio = slider.settings.speed / totalDimens;
            // determine which property to use
            property = slider.settings.mode === 'horizontal' ? 'left' : 'top';
            // calculate the new speed
            newSpeed = ratio * (totalDimens - (Math.abs(parseInt(el.css(property)))));
            tickerLoop(newSpeed);
          });
        }
      }
      // start the ticker loop
      tickerLoop();
    };

    /**
     * Runs a continuous loop, news ticker-style
     */
    var tickerLoop = function(resumeSpeed) {
      var speed = resumeSpeed ? resumeSpeed : slider.settings.speed,
      position = {left: 0, top: 0},
      reset = {left: 0, top: 0},
      animateProperty, resetValue, params;

      // if "next" animate left position to last child, then reset left to 0
      if (slider.settings.autoDirection === 'next') {
        position = el.find('.bx-clone').first().position();
      // if "prev" animate left position to 0, then reset left to first non-clone child
      } else {
        reset = slider.children.first().position();
      }
      animateProperty = slider.settings.mode === 'horizontal' ? -position.left : -position.top;
      resetValue = slider.settings.mode === 'horizontal' ? -reset.left : -reset.top;
      params = {resetValue: resetValue};
      setPositionProperty(animateProperty, 'ticker', speed, params);
    };

    /**
     * Check if el is on screen
     */
    var isOnScreen = function(el) {
      var win = $(window),
      viewport = {
        top: win.scrollTop(),
        left: win.scrollLeft()
      },
      bounds = el.offset();

      viewport.right = viewport.left + win.width();
      viewport.bottom = viewport.top + win.height();
      bounds.right = bounds.left + el.outerWidth();
      bounds.bottom = bounds.top + el.outerHeight();

      return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));
    };

    /**
     * Initializes keyboard events
     */
    var keyPress = function(e) {
      var activeElementTag = document.activeElement.tagName.toLowerCase(),
      tagFilters = 'input|textarea',
      p = new RegExp(activeElementTag,['i']),
      result = p.exec(tagFilters);

      if (result == null && isOnScreen(el)) {
        if (e.keyCode === 39) {
          clickNextBind(e);
          return false;
        } else if (e.keyCode === 37) {
          clickPrevBind(e);
          return false;
        }
      }
    };

    /**
     * Initializes touch events
     */
    var initTouch = function() {
      // initialize object to contain all touch values
      slider.touch = {
        start: {x: 0, y: 0},
        end: {x: 0, y: 0}
      };
      slider.viewport.on('touchstart MSPointerDown pointerdown', onTouchStart);

      //for browsers that have implemented pointer events and fire a click after
      //every pointerup regardless of whether pointerup is on same screen location as pointerdown or not
      slider.viewport.on('click', '.bxslider a', function(e) {
        if (slider.viewport.hasClass('click-disabled')) {
          e.preventDefault();
          slider.viewport.removeClass('click-disabled');
        }
      });
    };

    /**
     * Event handler for "touchstart"
     *
     * @param e (event)
     *  - DOM event object
     */
     /**
     * Event handler for "touchstart"
     *
     * @param e (event)
     *  - DOM event object
     */
    var onTouchStart = function(e) {
      // watch only for left mouse, touch contact and pen contact
      // touchstart event object doesn`t have button property
      if (e.type !== 'touchstart' && e.button !== 0) {
        return;
      }
      
        // intencionally commented out e.preventDefault()
      // see https://github.com/stevenwanderski/bxslider-4/pull/1214/files
      // e.preventDefault();

      //disable slider controls while user is interacting with slides to avoid slider freeze that happens on touch devices when a slide swipe happens immediately after interacting with slider controls
      slider.controls.el.addClass('disabled');

      if (slider.working) {
        slider.controls.el.removeClass('disabled');
      } else {
        // record the original position when touch starts
        slider.touch.originalPos = el.position();
	parentHorizontalPadding = slider.viewport.innerWidth() - slider.viewport.width();

       // In case slider parent have horizontal padding recalculate position
       if(parentHorizontalPadding > 0)
          slider.touch.originalPos.left -= (parentHorizontalPadding/2)


        var orig = e.originalEvent,
        touchPoints = (typeof orig.changedTouches !== 'undefined') ? orig.changedTouches : [orig];
		var chromePointerEvents = typeof PointerEvent === 'function';
		if (chromePointerEvents) {
			if (orig.pointerId === undefined) {
				return;
			}
		}
        // record the starting touch x, y coordinates
        slider.touch.start.x = touchPoints[0].pageX;
        slider.touch.start.y = touchPoints[0].pageY;

        if (e.target.setPointerCapture) {
          slider.pointerId = orig.pointerId;
          e.target.setPointerCapture(slider.pointerId);
        }
        // store original event data for click fixation
        slider.originalClickTarget = orig.originalTarget || orig.target;
        slider.originalClickButton = orig.button;
        slider.originalClickButtons = orig.buttons;
        slider.originalEventType = orig.type;
        // at this moment we don`t know what it is click or swipe
        slider.hasMove = false;
        // on a "touchmove" event to the viewport
        slider.viewport.on('touchmove MSPointerMove pointermove', onTouchMove);
        // on a "touchend" event to the viewport
        slider.viewport.on('touchend MSPointerUp pointerup', onTouchEnd);
        slider.viewport.on('MSPointerCancel pointercancel', onPointerCancel);
      }
    };

    /**
     * Cancel Pointer for Windows Phone
     *
     * @param e (event)
     *  - DOM event object
     */
    var onPointerCancel = function(e) {
      e.preventDefault();
      /* onPointerCancel handler is needed to deal with situations when a touchend
      doesn't fire after a touchstart (this happens on windows phones only) */
      setPositionProperty(slider.touch.originalPos.left, 'reset', 0);

      //remove handlers
      slider.controls.el.removeClass('disabled');
      slider.viewport.off('MSPointerCancel pointercancel', onPointerCancel);
      slider.viewport.off('touchmove MSPointerMove pointermove', onTouchMove);
      slider.viewport.off('touchend MSPointerUp pointerup', onTouchEnd);
      if (slider.viewport.get(0).releasePointerCapture) {
        slider.viewport.get(0).releasePointerCapture(slider.pointerId);
      }
    };

    /**
     * Event handler for "touchmove"
     *
     * @param e (event)
     *  - DOM event object
     */
    var onTouchMove = function(e) {

      if($(e.target).parent()[0].hasAttribute('href') && e.type=='pointermove' && ! ('ontouchstart' in window)){
        var href=$(e.target).parent().attr('href');
        $(e.target).parent().attr('data-href',href);
        $(e.target).parent().removeAttr('href');
      }

      var orig = e.originalEvent,
      touchPoints = (typeof orig.changedTouches !== 'undefined') ? orig.changedTouches : [orig],
      // if scrolling on y axis, do not prevent default
      xMovement = Math.abs(touchPoints[0].pageX - slider.touch.start.x),
      yMovement = Math.abs(touchPoints[0].pageY - slider.touch.start.y),
      value = 0,
      change = 0;
      // this is swipe
      slider.hasMove = true;

      // x axis swipe
      if ((xMovement * 3) > yMovement && slider.settings.preventDefaultSwipeX) {
        if (e.hasOwnProperty('cancelable') && e.cancelable) {
          e.preventDefault();
        }
      // y axis swipe
      } else if ((yMovement * 3) > xMovement && slider.settings.preventDefaultSwipeY) {
        if (e.hasOwnProperty('cancelable') && e.cancelable) {
          e.preventDefault();
        }
      }
      if (e.type !== 'touchmove') {
        if (e.hasOwnProperty('cancelable') && e.cancelable) {
          e.preventDefault();
        }
      }

      if (slider.settings.mode !== 'fade' && slider.settings.oneToOneTouch) {
        // if horizontal, drag along x axis
        if (slider.settings.mode === 'horizontal') {
          change = touchPoints[0].pageX - slider.touch.start.x;
          value = slider.touch.originalPos.left + change;
        // if vertical, drag along y axis
        } else {
          change = touchPoints[0].pageY - slider.touch.start.y;
          value = slider.touch.originalPos.top + change;
        }
        setPositionProperty(value, 'reset', 0);
      }
    };

    /**
     * Event handler for "touchend"
     *
     * @param e (event)
     *  - DOM event object
     */
    var onTouchEnd = function(e) {

      e.preventDefault();
      slider.viewport.off('touchmove MSPointerMove pointermove', onTouchMove);
      //enable slider controls as soon as user stops interacing with slides
      slider.controls.el.removeClass('disabled');
      var orig    = e.originalEvent,
      touchPoints = (typeof orig.changedTouches !== 'undefined') ? orig.changedTouches : [orig],
      value       = 0,
      distance    = 0;
      // record end x, y positions
      slider.touch.end.x = touchPoints[0].pageX;
      slider.touch.end.y = touchPoints[0].pageY;
      // if fade mode, check if absolute x distance clears the threshold
      if (slider.settings.mode === 'fade') {
        distance = Math.abs(slider.touch.start.x - slider.touch.end.x);
        if (distance >= slider.settings.swipeThreshold) {
          if (slider.touch.start.x > slider.touch.end.x) {
            el.goToNextSlide();
          } else {
            el.goToPrevSlide();
          }
          el.stopAuto();
        }
      // not fade mode
      } else {
        // calculate distance and el's animate property
        if (slider.settings.mode === 'horizontal') {
          distance = slider.touch.end.x - slider.touch.start.x;
          value = slider.touch.originalPos.left;
        } else {
          distance = slider.touch.end.y - slider.touch.start.y;
          value = slider.touch.originalPos.top;
        }
        // if not infinite loop and first / last slide, do not attempt a slide transition
        if (!slider.settings.infiniteLoop && ((slider.active.index === 0 && distance > 0) || (slider.active.last && distance < 0))) {
          setPositionProperty(value, 'reset', 200);
        } else {
          // check if distance clears threshold
          if (Math.abs(distance) >= slider.settings.swipeThreshold) {
            if (distance < 0) {
              el.goToNextSlide();
            } else {
              el.goToPrevSlide();
            }
            el.stopAuto();
          } else {
            // el.animate(property, 200);
            setPositionProperty(value, 'reset', 200);
          }
        }
      }
      slider.viewport.off('touchend MSPointerUp pointerup', onTouchEnd);

      if (slider.viewport.get(0).releasePointerCapture) {
        slider.viewport.get(0).releasePointerCapture(slider.pointerId);
      }
      // if slider had swipe with left mouse, touch contact and pen contact
      if (slider.hasMove === false && (slider.originalClickButton === 0 || slider.originalEventType === 'touchstart')) {
        // trigger click event (fix for Firefox59 and PointerEvent standard compatibility)
       if ('ontouchstart' in window) {

		$(slider.originalClickTarget).trigger({
		  type: 'click',
		  button: slider.originalClickButton,
		  buttons: slider.originalClickButtons
		});
           }
      }
        else if( slider.touch.start.x==slider.touch.end.x){

	  if ( ('ontouchstart' in window) || (/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor) && navigator.appVersion.indexOf("Win")!=-1)) {

                    if((/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor) && navigator.appVersion.indexOf("Win")!=-1)){
                        if( (! $(e.target).parent()[0].hasAttribute('href') || $(e.target).parent().attr('href')=='') && $(e.target).parent().attr('data-href')!=''){

                            var href=$(e.target).parent().attr('data-href');
                            $(e.target).parent().attr('href',href);

                        }
                    }

                    if( (/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor) && navigator.appVersion.indexOf("Win")!=-1) && ( $(e.target).parent()[0].hasAttribute('target') && $(e.target).parent().attr('target')=='_blank')){
                        
		
                    }
                    else{
                        
                        
                        	 $(slider.originalClickTarget).trigger({
                                    type: 'click',
                                    button: slider.originalClickButton,
                                    buttons: slider.originalClickButtons
                                });
                    }

          }
      }
      else{

          setTimeout(function(){
           if (slider.settings.mode === 'fade') {
            distance = Math.abs(slider.touch.start.x - slider.touch.end.x);

          // not fade mode
           } else {
            // calculate distance and el's animate property
            if (slider.settings.mode === 'horizontal') {
              distance = slider.touch.end.x - slider.touch.start.x;
              value = slider.touch.originalPos.left;
            } else {
              distance = slider.touch.end.y - slider.touch.start.y;
              value = slider.touch.originalPos.top;
            }
            // if not infinite loop and first / last slide, do not attempt a slide transition
            if (!slider.settings.infiniteLoop && ((slider.active.index === 0 && distance > 0) || (slider.active.last && distance < 0))) {
              setPositionProperty(value, 'reset', 200);
            } else {
              // check if distance clears threshold
              if (Math.abs(distance) >= slider.settings.swipeThreshold) {
                if (distance < 0) {
                  el.goToNextSlide();
                } else {
                  el.goToPrevSlide();
                }
                el.stopAuto();
              } else {
                     if((distance>=-10 && distance<=0)  || ( distance>=0 && distance<=5)){
			  if ('ontouchstart' in window) {
                                    $(slider.originalClickTarget).trigger({
                                    type: 'click',
                                    button: slider.originalClickButton,
                                    buttons: slider.originalClickButtons
                                });
                          }
                     }

              }
            }
          }
      }, 5);

      }

      if (slider.hasMove && e.type=='pointerup' && !('ontouchstart' in window)){

          if($(e.target).parent()[0].hasAttribute('data-href')){
            setTimeout(function(){
                var href=$(e.target).parent().attr('data-href');
                $(e.target).parent().attr('href',href);
            }, 5);
          }
      }
    }

	;
    /**
     * Window resize event callback
     */
    var resizeWindow = function(e) {
      // don't do anything if slider isn't initialized.
      if (!slider.initialized) { return; }
      // Delay if slider working.
      if (slider.working) {
        window.setTimeout(resizeWindow, 10);
      } else {
        // get the new window dimens (again, thank you IE)
        var windowWidthNew = $(window).width(),
        windowHeightNew = $(window).height();
        // make sure that it is a true window resize
        // *we must check this because our dinosaur friend IE fires a window resize event when certain DOM elements
        // are resized. Can you just die already?*
        if (windowWidth !== windowWidthNew || windowHeight !== windowHeightNew) {
          // set the new window dimens
          windowWidth = windowWidthNew;
          windowHeight = windowHeightNew;
          // update all dynamic elements
          el.redrawSlider();
          // Call user resize handler
          slider.settings.onSliderResize.call(el, slider.active.index);
        }
      }
    };

    /**
     * Adds an aria-hidden=true attribute to each element
     *
     * @param startVisibleIndex (int)
     *  - the first visible element's index
     */
    var applyAriaHiddenAttributes = function(startVisibleIndex) {
      var numberOfSlidesShowing = getNumberSlidesShowing();
      // only apply attributes if the setting is enabled and not in ticker mode
      if (slider.settings.ariaHidden && !slider.settings.ticker) {
        // add aria-hidden=true to all elements
        slider.children.attr('aria-hidden', 'true');
        // get the visible elements and change to aria-hidden=false
        slider.children.slice(startVisibleIndex, startVisibleIndex + numberOfSlidesShowing).attr('aria-hidden', 'false');
      }
    };

    /**
     * ===================================================================================
     * = PUBLIC FUNCTIONS
     * ===================================================================================
     */

    /**
     * Performs slide transition to the specified slide
     *
     * @param slideIndex (int)
     *  - the destination slide's index (zero-based)
     *
     * @param direction (string)
     *  - INTERNAL USE ONLY - the direction of travel ("prev" / "next")
     */
    el.goToSlide = function(slideIndex, direction) {
      // onSlideBefore, onSlideNext, onSlidePrev callbacks
      // Allow transition canceling based on returned value
      var performTransition = true,
      moveBy = 0,
      position = {left: 0, top: 0},
      lastChild = null,
      lastShowingIndex, eq, value, requestEl;

      // if plugin is currently in motion, ignore request
      if (slider.working || slider.active.index === slideIndex) { return; }
      // declare that plugin is in motion
      slider.working = true;
      // store the old index
      slider.oldIndex = slider.active.index;
      // if slideIndex is less than zero, set active index to last child (this happens during infinite loop)
      if (slideIndex < 0) {
        slider.active.index = getPagerQty() - 1;
      // if slideIndex is greater than children length, set active index to 0 (this happens during infinite loop)
      } else if (slideIndex >= getPagerQty()) {
        slider.active.index = 0;
      // set active index to requested slide
      } else {
        slider.active.index = slideIndex;
      }

      performTransition = slider.settings.onSlideBefore.call(el, slider.children.eq(slider.active.index), slider.oldIndex, slider.active.index);

      if (typeof (performTransition) !== 'undefined' && !performTransition) {
        slider.active.index = slider.oldIndex; // restore old index
        slider.working = false; // is not in motion
        return;
      }
      if (direction === 'next') {
        // Prevent canceling in future functions or lack there-of from negating previous commands to cancel
        if (!slider.settings.onSlideNext.call(el, slider.children.eq(slider.active.index), slider.oldIndex, slider.active.index)) {
          performTransition = false;
        }
      } else if (direction === 'prev') {
        // Prevent canceling in future functions or lack there-of from negating previous commands to cancel
        if (!slider.settings.onSlidePrev.call(el, slider.children.eq(slider.active.index), slider.oldIndex, slider.active.index)) {
          performTransition = false;
        }
      }

      // If transitions canceled, reset and return
      if (typeof (performTransition) !== 'undefined' && !performTransition) {
        slider.active.index = slider.oldIndex; // restore old index
        slider.working = false; // is not in motion
        return;
      }

      // check if last slide
      slider.active.last = slider.active.index >= getPagerQty() - 1;
      // update the pager with active class
      if (slider.settings.pager || slider.settings.pagerCustom) { updatePagerActive(slider.active.index); }
      // // check for direction control update
      if (slider.settings.controls) { updateDirectionControls(); }
      // if slider is set to mode: "fade"
      if (slider.settings.mode === 'fade') {
        // if adaptiveHeight is true and next height is different from current height, animate to the new height
        if (slider.settings.adaptiveHeight && slider.viewport.height() !== getViewportHeight()) {
          slider.viewport.animate({height: getViewportHeight()}, slider.settings.adaptiveHeightSpeed);
        }
        // fade out the visible child and reset its z-index value
        slider.children.filter(':visible').fadeOut(slider.settings.speed).css({zIndex: 0});
        // fade in the newly requested slide
        slider.children.eq(slider.active.index).css('zIndex', slider.settings.slideZIndex + 1).fadeIn(slider.settings.speed, function() {
          $(this).css('zIndex', slider.settings.slideZIndex);
          updateAfterSlideTransition();
        });
      // slider mode is not "fade"
      } else {
        // if adaptiveHeight is true and next height is different from current height, animate to the new height
        if (slider.settings.adaptiveHeight && slider.viewport.height() !== getViewportHeight()) {
          slider.viewport.animate({height: getViewportHeight()}, slider.settings.adaptiveHeightSpeed);
        }
        // if carousel and not infinite loop
        if (!slider.settings.infiniteLoop && slider.carousel && slider.active.last) {
          if (slider.settings.mode === 'horizontal') {
            // get the last child position
            lastChild = slider.children.eq(slider.children.length - 1);
            position = lastChild.position();
            // calculate the position of the last slide
            moveBy = slider.viewport.width() - lastChild.outerWidth();
          } else {
            // get last showing index position
            lastShowingIndex = slider.children.length - slider.settings.minSlides;
            position = slider.children.eq(lastShowingIndex).position();
          }
          // horizontal carousel, going previous while on first slide (infiniteLoop mode)
        } else if (slider.carousel && slider.active.last && direction === 'prev') {
          // get the last child position
          eq = slider.settings.moveSlides === 1 ? slider.settings.maxSlides - getMoveBy() : ((getPagerQty() - 1) * getMoveBy()) - (slider.children.length - slider.settings.maxSlides);
          lastChild = el.children('.bx-clone').eq(eq);
          position = lastChild.position();
        // if infinite loop and "Next" is clicked on the last slide
        } else if (direction === 'next' && slider.active.index === 0) {
          // get the last clone position
          position = el.find('> .bx-clone').eq(slider.settings.maxSlides).position();
          slider.active.last = false;
        // normal non-zero requests
        } else if (slideIndex >= 0) {
          requestEl = slideIndex * getMoveBy();
          position = slider.children.eq(requestEl).position();
        }

        /* If the position doesn't exist
         * (e.g. if you destroy the slider on a next click),
         * it doesn't throw an error.
         */
        if (typeof (position) !== undefined) {
          value = slider.settings.mode === 'horizontal' ? -(position.left - moveBy) : -position.top;
          // plugin values to be animated
          setPositionProperty(value, 'slide', slider.settings.speed);
        }
      }
      if (slider.settings.ariaHidden) { applyAriaHiddenAttributes(slider.active.index * getMoveBy()); }
    };

    /**
     * Transitions to the next slide in the show
     */
    el.goToNextSlide = function() {
      // if infiniteLoop is false and last page is showing, disregard call
      if (!slider.settings.infiniteLoop && slider.active.last) { return; }
      var pagerIndex = parseInt(slider.active.index) + 1;
      el.goToSlide(pagerIndex, 'next');
    };

    /**
     * Transitions to the prev slide in the show
     */
    el.goToPrevSlide = function() {
      // if infiniteLoop is false and last page is showing, disregard call
      if (!slider.settings.infiniteLoop && slider.active.index === 0) { return; }
      var pagerIndex = parseInt(slider.active.index) - 1;
      el.goToSlide(pagerIndex, 'prev');
    };

    /**
     * Starts the auto show
     *
     * @param preventControlUpdate (boolean)
     *  - if true, auto controls state will not be updated
     */
    el.startAuto = function(preventControlUpdate) {
      // if an interval already exists, disregard call
      if (slider.interval) { return; }
      // create an interval
      slider.interval = setInterval(function() {
        if (slider.settings.autoDirection === 'next') {
          el.goToNextSlide();
        } else {
          el.goToPrevSlide();
        }
      }, slider.settings.pause);
      // if auto controls are displayed and preventControlUpdate is not true
      if (slider.settings.autoControls && preventControlUpdate !== true) { updateAutoControls('stop'); }
    };

    /**
     * Stops the auto show
     *
     * @param preventControlUpdate (boolean)
     *  - if true, auto controls state will not be updated
     */
    el.stopAuto = function(preventControlUpdate) {
      // if no interval exists, disregard call
      if (!slider.interval) { return; }
      // clear the interval
      clearInterval(slider.interval);
      slider.interval = null;
      // if auto controls are displayed and preventControlUpdate is not true
      if (slider.settings.autoControls && preventControlUpdate !== true) { updateAutoControls('start'); }
    };

    /**
     * Returns current slide index (zero-based)
     */
    el.getCurrentSlide = function() {
      return slider.active.index;
    };

    /**
     * Returns current slide element
     */
    el.getCurrentSlideElement = function() {
      return slider.children.eq(slider.active.index);
    };

    /**
     * Returns a slide element
     * @param index (int)
     *  - The index (zero-based) of the element you want returned.
     */
    el.getSlideElement = function(index) {
      return slider.children.eq(index);
    };

    /**
     * Returns number of slides in show
     */
    el.getSlideCount = function() {
      return slider.children.length;
    };

    /**
     * Return slider.working variable
     */
    el.isWorking = function() {
      return slider.working;
    };

    /**
     * Update all dynamic slider elements
     */
    el.redrawSlider = function() {
      // resize all children in ratio to new screen size
      slider.children.add(el.find('.bx-clone')).outerWidth(getSlideWidth());
      // adjust the height
      slider.viewport.css('height', getViewportHeight());
      // update the slide position
      if (!slider.settings.ticker) { setSlidePosition(); }
      // if active.last was true before the screen resize, we want
      // to keep it last no matter what screen size we end on
      if (slider.active.last) { slider.active.index = getPagerQty() - 1; }
      // if the active index (page) no longer exists due to the resize, simply set the index as last
      if (slider.active.index >= getPagerQty()) { slider.active.last = true; }
      // if a pager is being displayed and a custom pager is not being used, update it
      if (slider.settings.pager && !slider.settings.pagerCustom) {
        populatePager();
        updatePagerActive(slider.active.index);
      }
      if (slider.settings.ariaHidden) { applyAriaHiddenAttributes(slider.active.index * getMoveBy()); }
    };

    /**
     * Destroy the current instance of the slider (revert everything back to original state)
     */
    el.destroySlider = function() {
      // don't do anything if slider has already been destroyed
      if (!slider.initialized) { return; }
      slider.initialized = false;
      $('.bx-clone', this).remove();
      slider.children.each(function() {
        if ($(this).data('origStyle') !== undefined) {
          $(this).attr('style', $(this).data('origStyle'));
        } else {
          $(this).removeAttr('style');
        }
      });
      if ($(this).data('origStyle') !== undefined) {
        this.attr('style', $(this).data('origStyle'));
      } else {
        $(this).removeAttr('style');
      }
      $(this).unwrap().unwrap();
      if (slider.controls.el) { slider.controls.el.remove(); }
      if (slider.controls.next) { slider.controls.next.remove(); }
      if (slider.controls.prev) { slider.controls.prev.remove(); }
      if (slider.pagerEl && slider.settings.controls && !slider.settings.pagerCustom) { slider.pagerEl.remove(); }
      $('.bx-caption', this).remove();
      if (slider.controls.autoEl) { slider.controls.autoEl.remove(); }
      clearInterval(slider.interval);
      if (slider.settings.responsive) { $(window).unbind('resize', resizeWindow); }
      if (slider.settings.keyboardEnabled) { $(document).unbind('keydown', keyPress); }
      //remove self reference in data
      $(this).removeData('bxSlider');
    };

    /**
     * Reload the slider (revert all DOM changes, and re-initialize)
     */
    el.reloadSlider = function(settings) {
      if (settings !== undefined) { options = settings; }
      el.destroySlider();
      init();
      //store reference to self in order to access public functions later
      $(el).data('bxSlider', this);
    };

    init();

    $(el).data('bxSlider', this);

    // returns the current jQuery object
    return this;
  };

})(jQuery);
