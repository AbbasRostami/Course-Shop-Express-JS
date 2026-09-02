import { RequestHandler } from "express";
import { searchService } from "./search.service.js";
import { SearchQuery } from "./search.validator.js";

// [GET] Search handler
export const searchController: RequestHandler = async (req, res) => {
  const result = await searchService.search(req.query as SearchQuery);
  return res.status(200).json({
    status: "success",
    data: result,
  });
};
