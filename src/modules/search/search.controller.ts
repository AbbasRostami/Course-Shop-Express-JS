import { RequestHandler } from "express";
import { localizePayload } from "../../utils/localize.js";
import { searchService } from "./search.service.js";
import { SearchQuery } from "./search.validator.js";

// [GET] Search handler with auto-localization
export const searchController: RequestHandler = async (req, res) => {
  const rawResult = await searchService.search(req.query as SearchQuery);

  const localizedResult = {
    query: rawResult.query,
    courses: localizePayload(rawResult.courses, req.locale),
    posts: localizePayload(rawResult.posts, req.locale),
  };

  return res.status(200).json({
    status: "success",
    data: localizedResult,
  });
};
