export interface RequestCutProposalsDto {
    feltType: string;
    requestedPieces: {
        width: number;
        height: number;
        quantity: number;
    }[];
}

export interface ProposedCutDto {
    width: number;
    height: number;
    sourceStockId: string;
}

export interface CutProposalDto {
    proposalId: string;
    proposedCuts: ProposedCutDto[];
    totalWaste: number;
}
