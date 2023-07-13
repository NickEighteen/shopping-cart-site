const productList = document.querySelector('.productWrap');
const productCategory = document.querySelector('.productSelect');
const cartList = document.querySelector('.shoppingCart-table');
const orderInfoBtn = document.querySelector('.orderInfo-btn');
let productData = [];
let cartData = [];
let cartPrice = 0;
// 資料初始化
function init(){
    getProductList();
    getCartList();
  }
init();
// 取得產品列表
function getProductList(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
    .then(function(response){    
    productData=response.data.products;    
    renderProductList();
  }).catch(function (err) {
    console.log(err);
  })
}
function combineProductHTMLItem(item){
   return `<li class="productCard">
             <h4 class="productType">新品</h4>
             <img src="${item.images}" alt="">
             <a href="#" class="addCardBtn" data-id="${item.id}" data-product="${item.title}">加入購物車</a>
             <h3>${item.title}</h3>
             <del class="originPrice">NT$${toThousands(item.origin_price)}</del>
             <p class="nowPrice">NT$${toThousands(item.price)}</p>
           </li>`
}
function renderProductList(){
    let str = "";    
    productData.forEach(function(item){      
      str += combineProductHTMLItem(item);
    })
    productList.innerHTML = str;
}
// 篩選產品列表
productCategory.addEventListener('change',filter);
function filter(){  
  let category = productCategory.value;
  if(category === "全部"){
    renderProductList();
    return;
  }
  let str= "";
  productData.forEach(function(item){
    if(item.category === category){
       str += combineProductHTMLItem(item);
    }
  productList.innerHTML = str;  
  })
}
// 取得購物車列表
function getCartList(){
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
  .then(function(response){    
  cartData=response.data.carts;
  cartPrice=toThousands(response.data.finalTotal);
  document.querySelector('.js-total').textContent=`NT$${cartPrice}`;
  renderCarList();
}).catch(function (err) {
  console.log(err);
})
}
function renderCarList(){
  let str = "";       
  cartData.forEach(function(item){        
    str +=`<tr>
              <td>
                  <div class="cardItem-title">
                      <img src="${item.product.images}" alt="">
                      <p>${item.product.title}</p>
                  </div>
              </td>
              <td>NT$${toThousands(item.product.price)}</td>
              <td>${item.quantity}</td>
              <td>NT$${toThousands(item.product.price * item.quantity)}</td>
              <td class="discardBtn">
                  <a href="#" class="material-icons" data-id="${item.id}" data-product="${item.product.title}">
                      clear
                  </a>
              </td>
            </tr>`
  })
  const cartbody = document.querySelector('.shoppingCart-tableList');
  cartbody.innerHTML = str;   
}
// 加入購物車
function addCartItem(id,product){
  let numCheck = 1;
  cartData.forEach(function(item){
    if (item.product.id === id) {
      numCheck = item.quantity += 1;
    }
  })
  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,{
    data: {
      "productId": id,
      "quantity": numCheck
    }
  }).
  then(function (response) {
      alert(`${product} 加入購物車成功`);
      getCartList();
  })
}
// 產品列表加入購物車
productList.addEventListener('click',function(e){
  e.preventDefault();
  let addCartClass = e.target.getAttribute("class");
  if (addCartClass !=="addCardBtn"){
     return;
  }
  let productId = e.target.getAttribute("data-id");
  let product = e.target.getAttribute("data-product");
  addCartItem(productId,product);
})
// 清除購物車內全部產品
function deleteAllCartList(){
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
  .then(function (response) {
      alert("刪除全部購物車成功！");
      getCartList();
  })
  .catch(function (response) {
    alert("購物車已清空，請勿重複點擊！")
  })
}
// 清除購物車內選定品項
function deleteCartItem(cartId,cartProduct) {
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`)
  .then(function (response) {
      alert(`購物車品項:${cartProduct} 刪除成功！`);
      getCartList();
  })
}
cartList.addEventListener('click',function(e){
  e.preventDefault();  
  let cartClass = e.target.getAttribute('class');
  let cartId = e.target.getAttribute('data-id');
  let cartProduct = e.target.getAttribute('data-product');
  if(cartClass === "material-icons" && cartId != null){
     deleteCartItem(cartId,cartProduct);
  }
  if(cartClass === "discardAllBtn"){
    deleteAllCartList();
 }
})
//送出訂單資料
orderInfoBtn.addEventListener('click',function(e){
   e.preventDefault();
   if (cartData.length == 0){
    alert("請加入至少一個購物車品項！");
    return;
  }
  let orderName = document.querySelector('#customerName').value;
  let orderTel = document.querySelector('#customerPhone').value;
  let orderEmail = document.querySelector('#customerEmail').value;
  let orderAddress = document.querySelector('#customerAddress').value;
  let orderPayment = document.querySelector('#tradeWay').value;  
  if (orderName == "" || orderTel == "" || orderEmail == "" || orderAddress==""){
    alert("請輸入訂單資訊！");
    return;
  }  
  if(validatePhone(orderTel)== false){
    alert("請輸入正確的手機電話");
    return
  }
  if(validateEmail(orderEmail)== false){
    alert("請輸入正確的Email");
    return
}
  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,
    {
      "data": {
        "user": {
          "name": orderName,
          "tel": orderTel,
          "email": orderEmail,
          "address": orderAddress,
          "payment": orderPayment
        }
      }
    }
  ).then(function (response) {
      alert("訂單建立成功!")
      document.querySelector('#customerName').value="";
      document.querySelector('#customerPhone').value="";
      document.querySelector('#customerEmail').value="";
      document.querySelector('#customerAddress').value="";
      document.querySelector('#tradeWay').value="ATM";
      getCartList();
    })
})
//檢查手機號碼
const customerPhone = document.querySelector('#customerPhone');
customerPhone.addEventListener('blur',function(e){
  if(validatePhone(customerPhone.value) == false){
    document.querySelector(`[data-message="電話"]`).textContent="請填寫正確手機號碼格式"
    return    
  }else{
    document.querySelector(`[data-message="電話"]`).textContent="必填"
    return    
  }
})
//檢查E-mail
const customerEmail = document.querySelector('#customerEmail');
customerEmail.addEventListener('blur',function(e){
  if(validateEmail(customerEmail.value) == false){
    document.querySelector(`[data-message="Email"]`).textContent="請填寫正確Email格式"
    return    
  }else{
    document.querySelector(`[data-message="Email"]`).textContent="必填"
    return    
  }
})
//util js 元件
function toThousands(x) { 
  let parts = x.toString().split("."); 
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join("."); 
}
function validatePhone(phone){
  if (/^[09]{2}\d{8}$/.test(phone)){  
     return true
  }    
     return false;
}
function validateEmail(mail){
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)){  
     return true
  }    
     return false;
}

