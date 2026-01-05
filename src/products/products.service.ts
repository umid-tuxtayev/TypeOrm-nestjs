import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private readonly productModel: Repository<Product>) { }
  async create(createProductDto: CreateProductDto) {
    let createProduc = await this.productModel.create(createProductDto);
    await this.productModel.save(createProduc);
    return { message: 'Product create successfully', status: 201 };
  }

  async findAll() {
    let products = await this.productModel.find()
    return { products, status: 200 };
  }

  async findOne(id: number) {
    let product = await this.productModel.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found !')
    return { product, status: 200 };
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    let product = await this.productModel.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found !')
    await this.productModel.update({ id }, updateProductDto)
    return { message: 'Product update successfully', status: 200 };
  }

  async remove(id: number) {
    let product = await this.productModel.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found !')
    await this.productModel.delete({ id })
    return { message: 'Product delete successfully', status: 200 };
  }
}
