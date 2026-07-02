import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Request,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { BranchesService } from './branches.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { assertBranchAccess, resolveBranchId } from '../auth/branch-scope.util';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { AddInventoryBatchDto } from './dto/add-inventory-batch.dto';
import { ReportWasteDto } from './dto/report-waste.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../common/http/swagger-error.decorators';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('branches')
@ApiCommonErrorResponses()
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  @ApiOperation({ summary: 'List branches' })
  @ApiOkResponse({ description: 'Branches retrieved' })
  findAll(@Request() req: RequestWithUser) {
    if (req.user.role === 'SUPER_ADMIN') {
      return this.branchesService.findAll();
    }
    const branchId = resolveBranchId(req.user);
    return this.branchesService.findAll(branchId);
  }

  @Roles('SUPER_ADMIN')
  @Post()
  @ApiOperation({ summary: 'Create branch' })
  @ApiOkResponse({ description: 'Branch created' })
  createBranch(@Body() dto: CreateBranchDto) {
    return this.branchesService.createBranch(dto);
  }

  @Get('transfers/all')
  @ApiOperation({ summary: 'List all transfers' })
  @ApiOkResponse({ description: 'Transfers retrieved' })
  getAllTransfers(@Request() req: RequestWithUser) {
    if (req.user.role === 'SUPER_ADMIN') {
      return this.branchesService.getAllTransfers();
    }
    const branchId = resolveBranchId(req.user);
    return this.branchesService.getTransfers(branchId);
  }

  @Roles('SUPER_ADMIN', 'MANAGER')
  @Post('transfers')
  @ApiOperation({ summary: 'Create stock transfer' })
  @ApiOkResponse({ description: 'Transfer created' })
  createTransfer(
    @Body() dto: CreateTransferDto,
    @Request() req: RequestWithUser,
  ) {
    assertBranchAccess(req.user, dto.fromBranchId);
    if (req.user.role !== 'SUPER_ADMIN') {
      assertBranchAccess(req.user, dto.toBranchId);
    }
    return this.branchesService.createTransfer({
      ...dto,
      requestedById: req.user.userId,
    });
  }

  @Roles('SUPER_ADMIN', 'MANAGER')
  @Post('transfers/:id/accept')
  @ApiOperation({ summary: 'Accept stock transfer' })
  @ApiOkResponse({ description: 'Transfer accepted' })
  acceptTransfer(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ) {
    return this.branchesService.acceptTransfer(id, req.user.userId, req.user);
  }

  @Roles('SUPER_ADMIN')
  @Patch(':id')
  @ApiOperation({ summary: 'Update branch' })
  @ApiOkResponse({ description: 'Branch updated' })
  updateBranch(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBranchDto,
  ) {
    return this.branchesService.updateBranch(id, dto);
  }

  @Roles('SUPER_ADMIN')
  @Post(':id/sync-inventory')
  @ApiOperation({ summary: 'Sync branch inventory' })
  @ApiOkResponse({ description: 'Inventory synchronized' })
  syncBranchInventory(@Param('id', ParseIntPipe) id: number) {
    return this.branchesService.syncBranchInventory(id);
  }

  @Get(':id/transfers')
  @ApiOperation({ summary: 'List transfers for branch' })
  @ApiOkResponse({ description: 'Branch transfers retrieved' })
  getTransfers(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ) {
    assertBranchAccess(req.user, id);
    return this.branchesService.getTransfers(id);
  }

  @Roles('SUPER_ADMIN', 'MANAGER')
  @Post(':id/batches')
  @ApiOperation({ summary: 'Add inventory batch to branch' })
  @ApiOkResponse({ description: 'Inventory batch added' })
  addInventoryBatch(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddInventoryBatchDto,
    @Request() req: RequestWithUser,
  ) {
    assertBranchAccess(req.user, id);
    return this.branchesService.addInventoryBatch(id, dto, req.user.userId);
  }

  @Roles('SUPER_ADMIN', 'MANAGER', 'STAFF')
  @Post(':id/waste')
  @ApiOperation({ summary: 'Report branch waste' })
  @ApiOkResponse({ description: 'Waste recorded' })
  reportWaste(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReportWasteDto,
    @Request() req: RequestWithUser,
  ) {
    assertBranchAccess(req.user, id);
    return this.branchesService.reportWaste(id, dto, req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get branch by id' })
  @ApiOkResponse({ description: 'Branch retrieved' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ) {
    assertBranchAccess(req.user, id);
    return this.branchesService.findOne(id);
  }
}
