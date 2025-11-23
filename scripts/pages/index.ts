import { getFrontProductsApi } from '@/scripts/api/front/products';
import {
  getFrontCartsApi,
  deleteFrontAllCartsApi,
  deleteFrontCartsApi,
  patchFrontCartsProductNumApi,
  postFrontCartsApi,
} from '@/scripts/api/front/carts';

import { postFrontOrderApi } from '@/scripts/api/front/orders';

import Swal from 'sweetalert2';
import validate from 'validate.js';
import type { AxiosResponse } from 'axios';
import { showSuccess, showError, currency } from '@/scripts/utilities';
import '@/scripts/index-animation';
import type { Product, CartsResponse } from '@/types/api';

// DOM
const productSelect = document.querySelector('.productSelect') as HTMLSelectElement;
const productWrap = document.querySelector('.productWrap') as HTMLElement;
const shoppingCart = document.querySelector('.shoppingCart') as HTMLElement;

const inputs = document.querySelectorAll(
  '#orderForm input[type=text],#orderForm input[type=tel],#orderForm input[type=email],#orderForm select'
) as NodeListOf<HTMLInputElement | HTMLSelectElement>;
const formEl = document.querySelector('.orderInfo-form') as HTMLFormElement;
const submit = document.querySelector('.orderInfo-btn') as HTMLElement;

// 驗證表單用的物件
const constraints: any = {
  姓名: {
    presence: {
      message: '必填！',
      // 無法只輸入空字串
      allowEmpty: false,
    },
  },

  電話: {
    presence: {
      message: '必填！',
    },
    format: {
      pattern: '^09[0-9]{8}$',
      message: '需符合手機的格式！',
    },
  },
  Email: {
    presence: {
      message: '必填！',
    },
    email: {
      message: '需符合電子信箱的格式！',
    },
  },
  寄送地址: {
    presence: {
      message: '必填！',
      allowEmpty: false,
    },
  },
  交易方式: {
    presence: {
      message: '必填！',
      allowEmpty: false,
    },
  },
};

// 暫存資料
let productsData: Product[] = [];
let cartsData: CartsResponse = { carts: [], finalTotal: 0 } as CartsResponse;
let canSubmit = false;

// 初始化：取得產品列表、取得購物車內容
const initApp = (): void => {
  getProducts();
  getCarts();
};

// 取得產品列表
const getProducts = (): void => {
  getFrontProductsApi()
    .then((res: AxiosResponse<Product[] | { products: Product[] }>) => {
      const data = (res.data as any).products ?? (res.data as any);
      productsData = data as Product[];
      renderProducts();
    })
    .catch((err: any) => {
      showError(err);
    });
};

// 產品篩選
const productsFilter = (e: Event): void => {
  const category = (e.target as HTMLSelectElement).value;
  if (category === '全部') {
    renderProducts();
  } else {
    const filteredData = productsData.filter((product) => product.category === category);
    renderProducts(filteredData);
  }
};
productSelect.addEventListener('change', productsFilter);

// 渲染產品列表
const renderProducts = (data: Product[] = productsData): void => {
  let template = '';

  data.forEach((product) => {
    template += `<li class="productCard">
    <h4 class="productType">新品</h4>
    <img
      src="${product.images}"
      alt="${product.title}"
    />
    <a href="#" class="addCardBtn" data-id="${product.id}">加入購物車</a>
    <h3>${product.title}</h3>
    <del class="originPrice">NT${currency(product.origin_price)}</del>
    <p class="nowPrice">NT${currency(product.price)}</p>
  </li>`;
  });
  productWrap.innerHTML = template;
};

// 取得購物車資料
const getCarts = (): void => {
  getFrontCartsApi()
    .then((res: AxiosResponse<CartsResponse>) => {
      cartsData = res.data;
      renderCarts();
    })
    .catch((err: any) => {
      showError(err);
    });
};

// 加入商品到購物車
const addProductToCart = (e: MouseEvent): void => {
  e.preventDefault();

  const target = e.target as HTMLElement;
  if (target.nodeName !== 'A') return;
  const { id } = target.dataset as { id: string };

  // 檢查購物車內是否有某商品存在
  let check = true;
  cartsData.carts.forEach((item) => {
    if (item.product.id === id) {
      check = false;
    }
  });

  // 如果沒有該商品，就加到購物車
  if (check) {
    const obj = {
      data: {
        productId: id,
        quantity: 1,
      },
    };

    postFrontCartsApi(obj)
      .then((res: AxiosResponse<CartsResponse>) => {
        cartsData = res.data;
        renderCarts();
        showSuccess('成功加入商品至購物車！');
      })
      .catch((err: any) => {
        showError(err);
      });
  } else {
    Swal.fire({
      title: '購物車內已有該商品！',
      icon: 'warning',
    });
  }
};
productWrap.addEventListener('click', addProductToCart);

// 渲染購物車
const renderCarts = (data: CartsResponse = cartsData): void => {
  // 購物車有產品就渲染到畫面
  if (data.carts.length > 0) {
    let template = '';
    data.carts.forEach((item) => {
      template += `
      <tr>
      <td>
        <div class="cardItem-title">
          <img src="${item.product.images}" alt="" />
          <p>${item.product.title}</p>
        </div>
      </td>
      <td>NT${currency(item.product.price)}</td>

      <td>
        <div class="addRemoveBtn">
          <button type="button" ${item.quantity === 1 ? 'disabled' : ''} class="cart-btn ${
        item.quantity === 1 ? '' : 'hover'
      } material-icons" data-js="remove" data-id="${item.id}"> remove </button>
          ${item.quantity}
          <button type="button" class="cart-btn hover material-icons" data-js="add" data-id="${
            item.id
          }"> add </button>
        </div>
      </td>

      <td>NT${currency(item.product.price * item.quantity)}</td>
      <td class="discardBtn">
        <a href="#" class="material-icons" data-js="deleteItem" data-id="${item.id}"> clear </a>
      </td>
    </tr>`;
    });

    shoppingCart.innerHTML = cartsTemplate(template, data.finalTotal);
    // 假如購物車有內容的話就綁上監聽
    const shoppingCartTable = document.querySelector('.shoppingCart-table') as HTMLElement;
    shoppingCartTable.addEventListener('click', cartsEventsHandler);
  } else if (data.carts.length === 0) {
    shoppingCart.innerHTML = `<h3 class="noneitem">購物車現在沒有東西~趕快去購物吧！</h3>`;
  }
};

// 購物車模板
const cartsTemplate = (productsStr: string, totalCost: number): string => {
  return ` <h3 class="section-title">我的購物車</h3>
  <div class="overflowWrap">
    <table class="shoppingCart-table">
      <thead>
        <tr>
          <th width="40%">品項</th>
          <th width="15%">單價</th>
          <th width="15%">數量</th>
          <th width="15%">金額</th>
          <th width="15%"></th>
        </tr>
      </thead>
      <tbody>
      ${productsStr}
      </tbody>
      <tfoot>
        <tr>
          <td>
            <a href="#" class="discardAllBtn"  data-js="deleteAllCarts">刪除所有品項</a>
          </td>
          <td></td>
          <td></td>
          <td>
            <p>總金額</p>
          </td>
          <td>NT${currency(totalCost)}</td>
        </tr>
      </tfoot>
    </table>
  </div>`;
};

// 監聽購物車行為
const cartsEventsHandler = (e: MouseEvent): void => {
  e.preventDefault();
  const doSomething = (e.target as HTMLElement).dataset.js as
    | 'deleteAllCarts'
    | 'deleteItem'
    | 'add'
    | 'remove'
    | undefined;
  if (doSomething === undefined) return;

  if (doSomething === 'deleteAllCarts') {
    deleteAllCart();
  } else if (doSomething === 'deleteItem') {
    const { id } = (e.target as HTMLElement).dataset as { id: string };
    deleteCartItem(id);
  } else if (doSomething === 'add' || doSomething === 'remove') {
    const { id } = (e.target as HTMLElement).dataset as { id: string };
    editCartsProductNum(id, doSomething);
  }
};

// 刪除購物車全部品項
const deleteAllCart = (): void => {
  Swal.fire({
    title: '確定要清空購物車嗎？',
    confirmButtonColor: '#6A33F8',
    confirmButtonText: '確認',
    cancelButtonText: '取消',
    showCancelButton: true,
    icon: 'warning',
  }).then((result: any) => {
    if (result.isConfirmed) {
      deleteFrontAllCartsApi()
        .then((res: AxiosResponse<CartsResponse>) => {
          cartsData = res.data;
          renderCarts();
          showSuccess('已清空購物車！');
        })
        .catch((err: any) => {
          showError(err);
        });
    }
  });
};
// 刪除購物車單一品項
const deleteCartItem = (id: string): void => {
  deleteFrontCartsApi(id)
    .then((res: AxiosResponse<CartsResponse>) => {
      cartsData = res.data;
      renderCarts();
    })
    .catch((err: any) => {
      showError(err);
    });
};

// 編輯購物車產品數量
const getCartItemById = (id: string) => {
  return cartsData.carts.find((item) => item.id === id);
};

const updateCartQuantity = (id: string, quantity: number): void => {
  const obj = {
    data: {
      id,
      quantity,
    },
  };
  patchFrontCartsProductNumApi(obj)
    .then((res: AxiosResponse<CartsResponse>) => {
      cartsData = res.data;
      renderCarts();
      showSuccess('成功更改購物車產品數量！');
    })
    .catch((err: any) => {
      showError(err);
    });
};

const editCartsProductNum = (id: string, doSomething: 'add' | 'remove'): void => {
  const item = getCartItemById(id);
  if (!item) return;
  const delta = doSomething === 'add' ? 1 : -1;
  const nextQty = item.quantity + delta;
  if (nextQty < 1) return;
  updateCartQuantity(id, nextQty);
};

// 訂單驗證
const formValidate = (): void => {
  let inputsArr = [...inputs];
  inputsArr.pop();

  inputsArr.forEach((item) => {
    (item.nextElementSibling as HTMLElement).textContent = '';
  });

  const errors: any = validate(formEl, constraints);

  if (errors) {
    const keys = Object.keys(errors);
    const values = Object.values(errors);

    keys.forEach((item, idx) => {
      const el = document.querySelector(`[data-message="${item}"]`) as HTMLElement;
      el.textContent = values[idx] as any;
    });
    canSubmit = false;
  } else {
    canSubmit = true;
  }
};

formEl.addEventListener('change', formValidate);

// 送出訂單
const submitOrder = (): void => {
  // 如果表單仍未通過驗證，按下 submit 按鈕後會重新驗證表單，不送出訂單
  if (!canSubmit) {
    formValidate();
    return;
  }

  // 購物車沒商品也不能送出表單
  if (cartsData.carts.length === 0) {
    Swal.fire({
      title: `購物車內目前沒有商品喔！`,
      icon: 'warning',
      confirmButtonText: '確定',
    });
    return;
  }

  const obj = {
    data: {
      user: {
        name: (inputs[0] as HTMLInputElement).value.trim(),
        tel: (inputs[1] as HTMLInputElement).value.trim(),
        email: (inputs[2] as HTMLInputElement).value.trim(),
        address: (inputs[3] as HTMLInputElement).value.trim(),
        payment: (inputs[4] as HTMLSelectElement).value,
      },
    },
  };

  postFrontOrderApi(obj)
    .then((res: any) => {
      showSuccess('成功送出訂單');
      formEl.reset();
      cartsData = {
        carts: [],
        finalTotal: 0,
      } as CartsResponse;
      renderCarts();
    })
    .catch((err: any) => {
      showError(err);
    });
};

submit.addEventListener('click', submitOrder);

initApp();


