import Swal from 'sweetalert2';
import * as c3 from 'c3';
import 'c3/c3.css';
import {
  getAdminOrdersApi,
  deleteAdminOrderApi,
  deleteAdminAllOrdersApi,
  putAdminOrderApi,
} from '@/scripts/api/admin/orders';

import { showSuccess, showError } from '@/scripts/utilities';
import '@/scripts/admin-animation';
import type { AxiosResponse } from 'axios';
import type { AdminOrder, AdminOrdersResponse } from '@/types/api';

// DOM
const orderBody = document.querySelector('.order-body') as HTMLElement;
const sortOrder = document.querySelector('#sortOrder') as HTMLSelectElement;
const discardAllBtn = document.querySelector('.discardAllBtn') as HTMLButtonElement;
const changeCategory = document.querySelector('#change-category') as HTMLButtonElement;
const changeDetail = document.querySelector('#change-detail') as HTMLButtonElement;
const sectionTitle = document.querySelector('.section-title') as HTMLElement;

let ordersData: AdminOrder[] = [];
const colorsArr: string[] = ['#301E5F', '#5434A7', '#9D7FEA', '#DACBFF'];

// 共用：更新訂單資料並重繪（可選擇重置篩選與顯示訊息）
const refreshOrders = (
  orders: AdminOrder[],
  options?: { resetFilter?: boolean; successMessage?: string }
): void => {
  const { resetFilter = false, successMessage } = options || {};
  ordersData = orders;
  renderOrder();
  renderC3();
  if (resetFilter) sortOrder.value = '全部';
  if (successMessage) showSuccess(successMessage);
};

// C3.js
const renderC3 = (): void => {
  const btnChange = document.querySelectorAll('.btn-change') as NodeListOf<HTMLButtonElement>;
  if (ordersData.length === 0) {
    btnChange.forEach((item) => {
      item.classList.add('d-none');
    });
    sectionTitle.innerHTML = '';
    c3.generate({
      bindto: '#chart',
      data: {
        type: 'pie',
        columns: [['目前沒有訂單', 1]],
        colors: { 目前沒有訂單: '#888888' },
      },
    });
  } else {
    btnChange.forEach((item) => {
      item.classList.remove('d-none');
    });
    // 全產品類別營收比重
    showObjCategory();
  }
};

// 全產品類別營收比重
const showObjCategory = (): void => {
  sectionTitle.innerHTML = '全產品類別營收比重';
  changeDetail.classList.remove('active');
  changeCategory.classList.add('active');

  const objCategory: Record<string, number> = {
    收納: 0,
    床架: 0,
    窗簾: 0,
  };

  ordersData.forEach((order) => {
    order.products.forEach((product) => {
      objCategory[product.category] += product.quantity * product.price;
    });
  });

  const objCategoryKeys = Object.keys(objCategory);
  const objCategoryValues = Object.values(objCategory);
  const objCategoryArr: Array<[string, number]> = [];

  objCategoryKeys.forEach((item, idx) => {
    objCategoryArr.push([objCategoryKeys[idx], objCategoryValues[idx]]);
  });

  // 營收大排到小
  objCategoryArr.sort((a, b) => b[1] - a[1]);

  const objCategoryColors: Record<string, string> = {};
  objCategoryArr.forEach((item, idx) => {
    objCategoryColors[item[0]] = colorsArr[idx];
  });

  c3.generate({
    bindto: '#chart',
    data: {
      type: 'pie',
      columns: objCategoryArr,
      colors: objCategoryColors,
    },
  });
};

// 全品項營收比重
const showObjDetail = (): void => {
  sectionTitle.innerHTML = '全品項營收比重';
  changeCategory.classList.remove('active');
  changeDetail.classList.add('active');
  const objDetail: Record<string, number> = {};
  ordersData.forEach((order) => {
    order.products.forEach((product) => {
      if (objDetail[product.title] === undefined) {
        objDetail[product.title] = product.quantity * product.price;
      } else {
        objDetail[product.title] += product.quantity * product.price;
      }
    });
  });

  const objDetailKeys = Object.keys(objDetail);
  const objDetailValues = Object.values(objDetail);

  const objDetailArr: Array<[string, number]> = [];
  
  objDetailKeys.forEach((item, idx) => {
    objDetailArr.push([objDetailKeys[idx], objDetailValues[idx]]);
  });

  // 由最大排到最小
  objDetailArr.sort((a, b) => b[1] - a[1]);

  // 分配顏色
  const objDetailColors: Record<string, string> = {};
  const objDetailArrLen = objDetailArr.length;

  // 品項大於三個時，把除了營收前三高的，都歸類為「其他」
  if (objDetailArrLen > 3) {
    const arrSpliced = objDetailArr.splice(3);

    let another = 0;
    arrSpliced.forEach((item) => (another += item[1]));
    objDetailArr.push(['其他', another]);

    objDetailArr.forEach((item, idx) => {
      objDetailColors[item[0]] = colorsArr[idx];
    });
  } else if (objDetailArrLen <= 3) {
    objDetailArr.forEach((item, idx) => {
      objDetailColors[item[0]] = colorsArr[idx];
    });
  }

  c3.generate({
    bindto: '#chart',
    data: {
      type: 'pie',
      columns: objDetailArr,
      colors: objDetailColors,
    },
  });
};
// 切換顯示
changeCategory.addEventListener('click', showObjCategory);
changeDetail.addEventListener('click', showObjDetail);

// 取得訂單列表
const getOrderList = (): void => {
  getAdminOrdersApi()
    .then((res: AxiosResponse<AdminOrdersResponse>) => {
      refreshOrders(res.data.orders);
    })
    .catch((err: any) => {
      showError(err);
    });
};

// 渲染訂單
const renderOrder = (data: AdminOrder[] = ordersData): void => {
  if (data.length === 0) {
    orderBody.innerHTML = '<tr><td colspan="8" class="text-center">當前項目沒有訂單</td></tr>';
  } else {
    sortOrders(data);
    let template = '';
    data.forEach((item) => {
      let productsStr = '';
      item.products.forEach((product) => {
        productsStr += `<li>${product.title} X ${product.quantity}</li>`;
      });

      template += `<tr>
      <td>${item.createdAt}</td>
      <td>
        <p>${item.user.name}</p>
        <p>${item.user.tel}</p>
      </td>
      <td>${item.user.address}</td>
      <td>${item.user.email}</td>
      <td>
        <ul>${productsStr}</ul>
      </td>
      <td>${calcOrderDay(item.createdAt)}</td>
      <td class="orderStatus">
        <a href="#" data-id="${item.id}" data-js="edit" data-paid="${item.paid}">${
        item.paid ? '已處理' : '未處理'
      }</a>
      </td>
      <td>
        <input type="button" class="delSingleOrder-Btn" value="刪除" data-order="${
          item.createdAt
        }" data-js="delete" data-id="${item.id}"/>
      </td>
    </tr>`;
    });
    orderBody.innerHTML = template;
  }
};

// 按照時間先後排列訂單，最舊的優先處理
const sortOrders = (data: AdminOrder[] = ordersData): void => {
  data.sort((a, b) => a.createdAt - b.createdAt);
};

// 秒轉換成日期字串
const calcOrderDay = (num: number): string => {
  // 秒轉成毫秒
  num = num * 1000;
  const date = new Date(num);

  const yearStr = date.getFullYear();
  let monthStr: number | string = date.getMonth() + 1;
  let dateStr: number | string = date.getDate();

  if (monthStr < 10) {
    monthStr = '0' + monthStr;
  }
  if (dateStr < 10) {
    dateStr = '0' + dateStr;
  }

  const str = `${yearStr}/${monthStr}/${dateStr}`;
  return str;
};

// 篩選訂單
const orderSelect = (e: Event): void => {
  const str = (e.target as HTMLSelectElement).value;
  if (str === '全部') {
    renderOrder();
  } else if (str === '未處理') {
    const renderData = ordersData.filter((item) => !item.paid);
    renderOrder(renderData);
  } else if (str === '已處理') {
    const renderData = ordersData.filter((item) => item.paid);
    renderOrder(renderData);
  }
};
sortOrder.addEventListener('change', orderSelect);

// 監聽訂單行為
const orderHandler = (e: MouseEvent): void => {
  e.preventDefault();
  const doSomething = (e.target as HTMLElement).dataset.js as 'edit' | 'delete' | undefined;
  if (doSomething === undefined) return;
  else if (doSomething === 'edit') {
    editOrder(e);
  } else if (doSomething === 'delete') {
    deleteOrder(e);
  }
};

// 刪除單一筆訂單
const deleteOrder = (e: MouseEvent): void => {
  const { id } = (e.target as HTMLElement).dataset as { id: string };
  const { order } = (e.target as HTMLElement).dataset as { order: string };
  Swal.fire({
    title: `確定要刪除訂單 ${order} 嗎？`,
    confirmButtonColor: '#6A33F8',
    confirmButtonText: '確認',
    cancelButtonText: '取消',
    showCancelButton: true,
    icon: 'warning',
  }).then((result: any) => {
    if (result.isConfirmed) {
      deleteAdminOrderApi(id)
        .then((res: AxiosResponse<AdminOrdersResponse>) => {
          refreshOrders(res.data.orders, { resetFilter: true, successMessage: `成功刪除訂單 ${order}！` });
        })
        .catch((err: any) => {
          showError(err);
        });
    }
  });
};

// 編輯訂單
const editOrder = (e: MouseEvent): void => {
  const { id } = (e.target as HTMLElement).dataset as { id: string };
  const isPaid = (e.target as HTMLElement).dataset.paid === 'true';
  const obj = {
    data: {
      id,
      paid: !isPaid,
    },
  };
  putAdminOrderApi(obj)
    .then((res: AxiosResponse<AdminOrdersResponse>) => {
      refreshOrders(res.data.orders, { resetFilter: true, successMessage: '訂單狀態修改完成' });
    })
    .catch((err: any) => {
      showError(err);
    });
};
orderBody.addEventListener('click', orderHandler);

// 刪除全部訂單
const deleteAllOrders = (): void => {
  if (ordersData.length === 0) {
    Swal.fire({
      title: '目前沒有任何訂單',
      icon: 'warning',
    });
  } else {
    Swal.fire({
      title: '確定要刪除所有訂單嗎？',
      confirmButtonColor: '#6A33F8',
      confirmButtonText: '確認',
      cancelButtonText: '取消',
      showCancelButton: true,
      icon: 'warning',
    }).then((result: any) => {
      if (result.isConfirmed) {
        deleteAdminAllOrdersApi()
          .then((res: AxiosResponse<AdminOrdersResponse>) => {
            refreshOrders(res.data.orders, { resetFilter: true, successMessage: '已刪除所有訂單！' });
          })
          .catch((err: any) => {
            showError(err);
          });
      }
    });
  }
};
discardAllBtn.addEventListener('click', deleteAllOrders);

getOrderList();


