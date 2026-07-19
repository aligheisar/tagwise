import { filesystemService } from "#/containers/filesystem.container";
import { libraryRepository } from "#/containers/repository.container";
import { ScannerService } from "#/services/scanner.service";

const scannerService = new ScannerService(libraryRepository, filesystemService);

export { scannerService };
