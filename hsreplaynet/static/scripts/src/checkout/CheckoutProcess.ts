export default class CheckoutProcess {
	public readonly plan: string;
	public readonly handler: StripeCheckoutHandler;
	public onstart: () => void;
	private promise: Promise<StripeTokenResponse>;

	constructor(plan, handler: StripeCheckoutHandler) {
		this.plan = plan;
		this.handler = handler;
	}

	public checkout(options?: StripeCheckoutOptions) {
		if (this.promise) {
			return this.promise;
		}
		let resolved = false;
		this.promise = new Promise((resolve, reject) => {
			const dollars = options.amount ? options.amount / 100 : null;
			options = Object.assign({}, options, {
				token: (token: StripeTokenResponse): void => {
					resolved = true;
					resolve(token);
					this.trackInteraction("subscribe", dollars);
				},
				opened: () => {
					if (this.onstart) {
						this.onstart();
					}
					this.trackInteraction("open", dollars);
				},
				closed: () => {
					if (resolved) {
						return;
					}
					reject();
					this.trackInteraction("close", dollars);
				},
			});
			this.handler.open(options);
		});
		return this.promise;
	}

	private trackInteraction(action: string, value?: any) {
		if (typeof ga !== "function") {
			return;
		}
		ga("send", {
			hitType: "event",
			eventCategory: "Checkout",
			eventAction: action,
			eventValue: value,
		});
	}
}
