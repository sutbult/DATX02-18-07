module BidList.Types exposing (..)

import BidList.Table.Types as TableTypes
import BidList.Filter.Types as FilterTypes
import Error.Types
import Bid.Types exposing
    ( Bid
    )


type alias Model =
    { table : TableTypes.Model
    , filter : FilterTypes.Model
    , error : Error.Types.Model
    , bidPath : String
    }


type Msg
    = ToTable TableTypes.Msg
    | ToFilter FilterTypes.Msg
    | ToError Error.Types.Msg
    | SetBids (List Bid)
    | UpdateBids
    | BidClick Bid


mapTableCmd : TableTypes.Msg -> Msg
mapTableCmd msg =
    case msg of
        TableTypes.Click bid ->
            BidClick bid

        subMsg ->
            ToTable subMsg
