import * as React from 'react';
import { ISandwitchShopProps, ISandwitchShopState, ISandwitch } from './ISandwitchShopProps';
import pnp, { sp } from 'sp-pnp-js';

export default class SandwitchShop extends React.Component<ISandwitchShopProps, ISandwitchShopState> {
  constructor(props: ISandwitchShopProps) {
    super(props);
    this.state = {
      orders: [],
      sandwitchName: '0',
      quantity: 1,
      sandwitches: []
    }
    this.readItems('Sandwiches');
    this.onChange = this.onChange.bind(this);
    this.add = this.add.bind(this);
    this.remove = this.remove.bind(this);
    this.submit = this.submit.bind(this);
  }

  onChange(e) {
    e.preventDefault();
    this.setState({ [e.target.name]: e.target.value } as ISandwitchShopState);
    console.log('state is ', this.state, e.target.name, e.target.value)
  }
  private add() {
    let orders = this.state.orders;
    let newSandwitch = this.state.sandwitches.filter(s => s.Id.toString() == this.state.sandwitchName);
    if (newSandwitch.length == 0)
      return;
    console.log('New Sandwitch ', newSandwitch);
    orders.push({ sandwitches: newSandwitch[0], quantity: this.state.quantity });
    this.setState({ orders: orders, sandwitchName: '0', quantity: 1 });
  }

  private remove() {
    let orders = this.state.orders;
    orders.pop();
    this.setState({ orders: orders });
  }

  private submit() {
    if (this.state.orders.length == 0)
      return;
    console.log('Order is ', this.state.orders);
    this.createBatchItems();
  }

  private createBatchItems() {
    let batch = pnp.sp.createBatch();

    this.state.orders.forEach(order => {
      pnp.sp.web.lists.getByTitle("SandwithOrders").items.inBatch(batch).add({
        Title: order.sandwitches.Title,
        SandwichId: order.sandwitches.Id,
        quantity: order.quantity
      }).then(r => {
        console.log(r)
      });

    });


    // pnp.sp.web.lists.getByTitle("SandwithOrders").items.inBatch(batch).add({
    //   Title: "My Item Title 2",
    //   SandwichId: 1
    // }).then(r => {
    //   console.log(r)
    // });

    batch.execute().then(() => {
      console.log("All done!");
      alert('Successfully Submitted');
      this.setState({orders: []});
    });
  }

  private readItems(listName: string): void {
    sp.web.lists.getByTitle(listName)
      .items.select('Title', 'Id', 'unitPrice').get()
      .then((items: ISandwitch[]): void => {
        console.log('Items are ', items);
        this.setState({ sandwitches: items });
      }, (error: any): void => {
        console.error('Oops error occured', error);
      });
  }

  public render(): React.ReactElement<ISandwitchShopProps> {
    let totalPrice = 0;
    this.state.orders.forEach(item => totalPrice += item.sandwitches.unitPrice * item.quantity);
    return (
      <div className="container-fluid">
        <div className="card">
          <div className="card-header">
            <div className="row">
              <div className="col">
                <div className="form-group">
                  <label htmlFor="sandwtich">Choose Sandwitch</label>
                  <select className="form-control" value={this.state.sandwitchName} name="sandwitchName" onChange={this.onChange}>
                    <option value="0" disabled>Select Sandwiches...</option>
                    {this.state.sandwitches.map(item => <option key={item.Id} value={item.Id}>{item.Title}</option>)}
                  </select>
                </div>
              </div>
              <div className="col">
                <div className="form-group">
                  <label htmlFor="quantity">Quantity</label>
                  <input type="number" onChange={this.onChange} min="1" className="form-control" value={this.state.quantity} name="quantity" />
                </div>
              </div>
            </div>
          </div>
          <div className="card-body">
            <button type="button" onClick={this.add} className="btn btn-primary  m-2">+</button>
            <button type="button" onClick={this.remove} className="btn btn-primary m-2">-</button>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th scope="col">Sandwith Name</th>
                  <th scope="col">Unit Price</th>
                  <th scope="col">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {this.state.orders.map(item => <tr>
                  <td>{item.sandwitches.Title}</td>
                  <td>{item.sandwitches.unitPrice}</td>
                  <td>{item.quantity}</td>
                </tr>)}
              </tbody>
            </table>
          </div>
          <div className="card bg-info text-white">
            <div className="card-body font-weight-bold">Total Price : {totalPrice.toFixed(2)}</div>
          </div>
          <div className="card-footer">
            <button onClick={this.submit} type="button" className="btn btn-primary">Submit</button>
          </div>
        </div>

      </div>
    );
  }
}
