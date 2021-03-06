import { LightningElement, wire } from "lwc";

import { publish, subscribe, MessageContext } from "lightning/messageService";
import PRODUCT_FILTER_MESSAGE from "@salesforce/messageChannel/ProductsFiltered__c";
import PRODUCT_SELECTED_MESSAGE from "@salesforce/messageChannel/ProductSelected__c";
import { refreshApex } from "@salesforce/apex";
import getProducts from "@salesforce/apex/ProductController.getProducts";

export default class CycleProductTileList extends LightningElement {
  pageNumber = 1;
  pageSize;
  totalItemCount = 0;
  filters = {};

  @wire(MessageContext) messageContext;

  productFilterSubscription;

  @wire(getProducts, { filters: "$filters", pageNumber: "$pageNumber" })
  products;

  @wire(getProducts, { filters: "$filters", pageNumber: "$pageNumber" })
  products2({ error, data }) {
    if (data) {
      console.log("success");
    } else {
      console.log(error);
    }
  }

  connectedCallback() {
    this.productFilterSubscription = subscribe(
      this.messageContext,
      PRODUCT_FILTER_MESSAGE,
      (message) => this.handleFilterChange(message)
    );

    refreshApex(this.products2);
  }

  handleFilterChange(message) {
    this.filters = { ...message.filters };
    this.pageNumber = 1;
    console.log("Filter change:::", this.filters);
  }

  handleProductSelected(event) {
    publish(this.messageContext, PRODUCT_SELECTED_MESSAGE, {
      productId: event.detail
    });
  }

  handlePreviousPage() {
    this.pageNumber = this.pageNumber - 1;
  }
  handleNextPage() {
    this.pageNumber = this.pageNumber + 1;
  }
}
