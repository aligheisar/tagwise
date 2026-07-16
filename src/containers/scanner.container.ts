import { LibraryRepository } from "@/repositories/library.repository";
import { FilesystemService } from "@/services/filesystem.service";
import { ScannerService } from "@/services/scanner.service";

const libraryRepository = new LibraryRepository();
const filesystem = new FilesystemService();

const scannerService = new ScannerService(libraryRepository, filesystem);

export { scannerService };
