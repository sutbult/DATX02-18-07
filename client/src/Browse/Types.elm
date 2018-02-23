module Browse.Types exposing (..)

import Browse.Bids.Types
import Browse.Filter.Types

type alias Model =
    { bids : Browse.Bids.Types.Model
    , filter : Browse.Filter.Types.Model
    }

type Msg
    = Bids Browse.Bids.Types.Msg
    | Filter Browse.Filter.Types.Msg
    | SetBids (List Browse.Bids.Types.Bid)
