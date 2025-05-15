"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderItem = exports.Order = exports.Address = exports.User = exports.OrderStatus = void 0;
const class_validator_1 = require("class-validator");
const typeorm_1 = require("typeorm");
const Product_1 = require("./Product");
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PLACED"] = "Placed";
    OrderStatus["PROCESSING"] = "Processing";
    OrderStatus["SHIPPED"] = "Shipping";
    OrderStatus["DELIVERED"] = "Delivered";
    OrderStatus["CANCELLED"] = "Cancelled";
    OrderStatus["REFUNDED"] = "Refunded";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
let User = class User {
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNotEmpty)({ message: "Username is required." }),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    (0, class_validator_1.IsEmail)({}, { message: "Please enter a valid email address." }),
    (0, class_validator_1.IsNotEmpty)({ message: "Email is required." }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
        message: "Password must contain at least one uppercase letter, one lowercase letter, one numeric digit, and one special character.",
    }),
    (0, class_validator_1.MinLength)(8, { message: "Password must be at least 8 characters long." }),
    (0, class_validator_1.IsNotEmpty)({ message: "Password is required." }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "bigint", nullable: true }),
    (0, class_validator_1.Length)(10, 10, { message: "Phone number must be exactly 10 digits long." }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], User.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", default: { public_id: "", url: "" } }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], User.prototype, "profileImage", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], User.prototype, "token", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Address, (address) => address.user, {
        cascade: true,
        eager: true,
    }),
    __metadata("design:type", Array)
], User.prototype, "addresses", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Order, (order) => order.user, { cascade: true }),
    __metadata("design:type", Array)
], User.prototype, "orders", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: "timestamp" }),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: "timestamp" }),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)()
], User);
let Address = class Address {
};
exports.Address = Address;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Address.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsString)({ message: "Line1 must be a string" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Line1 is required" }),
    __metadata("design:type", String)
], Address.prototype, "line1", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_validator_1.IsString)({ message: "Line2 must be a string" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Line2 is required" }),
    __metadata("design:type", String)
], Address.prototype, "line2", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_validator_1.IsNotEmpty)({ message: "City is required" }),
    __metadata("design:type", String)
], Address.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNotEmpty)({ message: "State is required" }),
    __metadata("design:type", String)
], Address.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.Length)(6, 6, { message: "Pincode must be exactly 6 digits long." }),
    (0, class_validator_1.IsString)({ message: "pincode must be a string" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Pincode is required" }),
    __metadata("design:type", String)
], Address.prototype, "pincode", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Address.prototype, "isDefault", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User, (user) => user.addresses, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", User)
], Address.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: "timestamp" }),
    __metadata("design:type", Date)
], Address.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: "timestamp" }),
    __metadata("design:type", Date)
], Address.prototype, "updatedAt", void 0);
exports.Address = Address = __decorate([
    (0, typeorm_1.Entity)()
], Address);
let Order = class Order {
};
exports.Order = Order;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Order.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "float" }),
    __metadata("design:type", Number)
], Order.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "float", default: 0 }),
    __metadata("design:type", Number)
], Order.prototype, "discount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "float", default: 0 }),
    __metadata("design:type", Number)
], Order.prototype, "netTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "float" }),
    __metadata("design:type", Number)
], Order.prototype, "deliveryCharge", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: OrderStatus, default: OrderStatus.PLACED }),
    __metadata("design:type", String)
], Order.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "stripeSessionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User, (user) => user.orders, { onDelete: "CASCADE" }),
    __metadata("design:type", User)
], Order.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => OrderItem, (orderItem) => orderItem.order, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], Order.prototype, "orderItems", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Address, {
        eager: true,
    }),
    __metadata("design:type", Address)
], Order.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: "timestamp" }),
    __metadata("design:type", Date)
], Order.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: "timestamp" }),
    __metadata("design:type", Date)
], Order.prototype, "updatedAt", void 0);
exports.Order = Order = __decorate([
    (0, typeorm_1.Entity)()
], Order);
let OrderItem = class OrderItem {
};
exports.OrderItem = OrderItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], OrderItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], OrderItem.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "float" }),
    __metadata("design:type", Number)
], OrderItem.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "float" }),
    __metadata("design:type", Number)
], OrderItem.prototype, "totalPrice", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], OrderItem.prototype, "color", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Order, (order) => order.orderItems, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", Order)
], OrderItem.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Product_1.Product, { eager: true }),
    __metadata("design:type", Product_1.Product)
], OrderItem.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: "timestamp" }),
    __metadata("design:type", Date)
], OrderItem.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: "timestamp" }),
    __metadata("design:type", Date)
], OrderItem.prototype, "updatedAt", void 0);
exports.OrderItem = OrderItem = __decorate([
    (0, typeorm_1.Entity)()
], OrderItem);
