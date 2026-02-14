import { AuthProbeService2 } from '../services/auth-2';
import { AuthService } from '../services/auth-service';
import { GeoJsonService } from '../services/geo-json';
import { ImageService } from '../services/image-service';
import { SearchService } from '../services/search';
import { Search2Service } from '../services/search-2';

export type Service = AuthService | GeoJsonService | ImageService | SearchService | AuthProbeService2 | Search2Service;
