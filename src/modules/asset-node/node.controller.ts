import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { NodeService } from './node.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateNodeDto } from './dto/create-node.dto';
import { UpdateNodeDto } from './dto/update-node.dto';

@Controller('node')
export class NodeController {
  constructor(private readonly nodeService: NodeService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/')
  create(@Body() createNodeDto: CreateNodeDto) {
    return this.nodeService.create(createNodeDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/asset/:assetId')
  getNodesByAssetId(@Param('assetId') assetId: string) {
    return this.nodeService.getNodesByAssetId(assetId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('network/:networkId')
  getNodesByAssetid(@Param('networkId') networkId: string) {
    return this.nodeService.getNodesByNetworkId(networkId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:nodeId')
  updateNode(
    @Param('nodeId') nodeId: string,
    @Body() updateNodeDto: UpdateNodeDto,
  ) {
    return this.nodeService.updateNode(updateNodeDto, nodeId);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Delete('/:nodeId')
  deleteNode(@Param('nodeId') nodeId: string) {
    return this.nodeService.deleteNode(nodeId);
  }
}
