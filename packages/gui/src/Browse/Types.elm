module Browse.Types exposing (..)

import BidList.Table.Types as TableTypes
import Browse.Accept.Types as AcceptTypes
import BidList.Filter.Types as FilterTypes
import Error.Types
import Bid.Types exposing (Bid)


type alias Model =
    { table : TableTypes.Model
    , filter : FilterTypes.Model
    , error : Error.Types.Model
    , accept : AcceptTypes.Model
    }


type Msg
    = ToTable TableTypes.Msg
    | Filter FilterTypes.Msg
    | Error Error.Types.Msg
    | ToAccept AcceptTypes.Msg
    | SetBids (List Bid)
    | UpdateBids


mapTableCmd : TableTypes.Msg -> Msg
mapTableCmd msg =
    case msg of
        TableTypes.Click bid ->
            ToAccept <| AcceptTypes.DisplayModal bid

        subMsg ->
            ToTable subMsg
